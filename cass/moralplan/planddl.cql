CREATE KEYSPACE moralplan
WITH REPLICATION = {
	'class' : 'SimpleStrategy',
	'replication_factor' : 1
};
 
use moralplan;

-- 
-- 1. Beliefs.
-- 

-- The beliefs behind my moral plans. A belief is identified by its name.
-- E.g., name="canonical roman catholicism", tags=relgion,christiantity,catholicism
-- E.g., name="mike's inclusive catholicism", tags=relgion.christiantity.catholicism,married-priests,lgbt-compassion
create table belief (
	name text primary key,
	defining_participant text,
	description text,
	tags set<text>);

-- 
-- 2. Plans.
-- 

create type plan_action (
	action_type text,
	description text,
	action_ts timestamp,
	grade float,
	cost float,
	roles map<text, frozen<set<text>>> -- maps participant.name to set of roles in this plan

);

create type plan_review (
	description text,
	review_ts timestamp,
	grade float,
	cost float,
	comments set<text>,
	exceptions set<text>,
	roles map<text, frozen<set<text>>> -- maps participant.name to set of roles in this plan

);

create type related_plan (
	plan_name text,
	relationship_type text
);

-- A moral plan, identified by unique but user-friendly name.
-- For roles, it maps participant name to one or more roles.
-- Participant can be human, nature, or an object (e.g., person.mike, nature.environment, nature.mike_garden, persongroup.africa)
-- Role is something like sponsor, actor, recipiebt. 
create table plan (
	name text primary key,
	description text,
	mission_statement text,
	creation_ts timestamp,
	end_ts timestamp,
	state text,
	tags set<text>, // plan tags + belief tags
	beliefs set<text>, // set of belief names, refers to belief.name
	roles map<text, frozen<set<text>>>, -- maps participant.name to set of roles in this plan
	numeric_goal float, -- target extrinsic value of the plan measured [0,1]  
	numeric_progress float, -- current extrinsic value of the plan measured [0,1]
	actions list<FROZEN<plan_action>>,
	reviews list<frozen<plan_review>>,
	related_plans set<frozen<related_plan>>);

-- 
-- 3. Alternate views to queries.
-- 

-- The plans in which the given participant plays a role.
-- It is grouped by role.
create table plan_for_participant (
	participant_name text,
	role text,
	plan_name text,
	primary key (participant_name, role, plan_name)
) WITH CLUSTERING ORDER BY ( role asc, plan_name asc );

-- The beliefs defined by the given participant
create table belief_for_participant (
	participant_name text,
	belief_name text,
	primary key (participant_name, belief_name)
) WITH CLUSTERING ORDER BY ( belief_name asc );

-- all tags in one partition
create table all_tags (
	dummy int,
	tag text,
	primary key (dummy, tag)
) WITH CLUSTERING ORDER BY (tag asc );

-- all MY tags in one partition
create table my_tags (
	participant text,
	tag text,
	primary key (participant, tag)
) WITH CLUSTERING ORDER BY (tag asc );
