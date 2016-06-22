CREATE KEYSPACE moralplan
WITH REPLICATION = {
	'class' : 'SimpleStrategy',
	'replication_factor' : 1
};

USE moralplan;

-- 
-- Primitive types used in a lot of places:
-- participant_name: person.X, persongroup.Y, object.Z, nature.W
-- roles: actor, recipient, reviewer, fixer
-- all floats are [0,1] measures; 0 is terrible, 1 is perfect
-- 

-- 
-- 1. Beliefs.
-- 

-- The beliefs behind my moral plans.
CREATE TABLE belief (
	name TEXT PRIMARY KEY, -- unique user-friendly name
	defining_participant_name TEXT, -- who defined it (NOT who thought it up!); type=participant_name 
	definition_ts TIMESTAMP, -- when it was defined (NOT when it was though up!)
	description TEXT,
	tags SET<TEXT> -- set of tags describing the belief

);

-- 
-- 2. Plans.
-- 

-- UDT for action in a plan
CREATE TYPE plan_action (
	action_type TEXT, -- e.g., helpful act, helpful words, sending money, hitting someone, issuing a kill order
	description TEXT,
	action_ts TIMESTAMP,
	roles map<TEXT, FROZEN<SET<TEXT>>> -- who acted or was acted upon; 
	-- maps participant name to her roles; e.g. (mike, actor), (old_lady, recipient)
);

-- UDT for review of a plan
CREATE TYPE plan_review (
	description TEXT,
	review_ts TIMESTAMP,
	grade FLOAT, -- how is the plan going: [0,1] 
	cost FLOAT, -- how much has the plan cost: [0,1] 
	goodness FLOAT, -- how good (i.e., dutiful) is the plan: [0,1]
	benefit FLOAT, -- how beneficial is the plan in its effects: [0,1]
	progress FLOAT, -- how far along is the plan: [0,1]
	comments TEXT, -- commentary on plan
	exceptions LIST<TEXT>, -- a list of specific issues with the plan
	roles map<TEXT, FROZEN<SET<TEXT>>> -- who reviewed, who was blamed, who needs to fix
	-- maps participant name to her roles; e.g., (mike, reviewer), (joe, blamee, fixer), (bill, fixer)

);

-- UDT for a plan relationship
CREATE TYPE related_plan (
	plan_name TEXT,
	relationship_type TEXT -- merge, mission_similarity, recipient_similiary, etc.

);

-- A moral plan, identified by unique but user-friendly name.
-- For roles, it maps participant name to one or more roles.
-- Participant can be human, nature, or an object (e.g., person.mike, nature.environment, nature.mike_garden, persongroup.africa)
-- Role is something like sponsor, actor, recipient. 
CREATE TABLE plan (
	name TEXT PRIMARY KEY, -- unique, user-friendly name
	description TEXT,
	mission_statement TEXT,
	creation_ts TIMESTAMP,
	end_ts TIMESTAMP, -- optional; only set if state is ABORTED or COMPLETE 
	state TEXT, -- DRAFTED, ACTIVE, ABORTED, COMPLETE, INREVIEW
	tags SET<TEXT>, -- plan tags + belief tags
	beliefs SET<TEXT>, -- SET of guilding belief names, refers to belief.name
	roles MAP<TEXT, FROZEN<SET<TEXT>>>, -- maps participant to her roles; e.g. (mike, (founder,actor)), (poor country, recipient)
	actions LIST<FROZEN<plan_action>>, -- list of actions carried out in this plan
	reviews LIST<FROZEN<plan_review>>, -- list of reviews conducted in this plan
	related_plans SET<FROZEN<related_plan>> -- list of related plans, enabling construction of a basic plan-web graph
);

--
-- 3. Alternate views for queries.
-- 

-- The plans in which the given participant plays a role.
-- It is grouped by role.
CREATE TABLE plan_for_participant (
	participant_name TEXT,
	role TEXT,
	plan_name TEXT,
	PRIMARY KEY (participant_name, role, plan_name)
) WITH CLUSTERING ORDER BY ( role ASC, plan_name ASC );

-- The beliefs defined by the given participant
CREATE TABLE belief_for_participant (
	participant_name TEXT,
	belief_name TEXT,
	PRIMARY KEY (participant_name, belief_name)
) WITH CLUSTERING ORDER BY ( belief_name ASC );

-- all tags in one partition
CREATE TABLE all_tags (
	dummy int, -- always set to 1; all tags appear in same partition, get them all in one read
	tag TEXT,
	PRIMARY KEY (dummy, tag)
) WITH CLUSTERING ORDER BY ( tag ASC );

-- all tags for one participant in one partition
CREATE TABLE my_tags (
	participant_name TEXT,
	tag TEXT,
	PRIMARY KEY (participant_name, tag)
) WITH CLUSTERING ORDER BY ( tag ASC );
