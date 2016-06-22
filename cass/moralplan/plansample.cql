USE moralplan;

--
-- 1. two beliefs
-- 

INSERT INTO belief (name, defining_participant_name, definition_ts, description, tags) 
VALUES ('Sartrean Existentialism', 'person.mhavey', dateof(now()), 'Existentialism of Jean Paul Sartre', 
	{'philosophy', 'existentialism'}
); 
INSERT INTO all_tags(dummy,tag) VALUES (1, 'philosophy');
INSERT INTO all_tags(dummy,tag) VALUES (1, 'existentialism');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.mhavey', 'philosophy');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.mhavey', 'existentialism');

INSERT INTO belief_for_participant(participant_name, belief_name) VALUES ('person.mhavey', 'Sartrean Existentialism');

INSERT INTO belief (name, defining_participant_name, definition_ts, description, tags) 
VALUES ('Contemporary American Liberal Roman Catholicism', 'person.ikant', dateof(now()), 'RC with 2010+ belief in married priests, LGBT rights, and other reforms', 
	{'philosophy', 'religion', 'catholicism', 'roman catholicism', 'liberal', 'married priest', 'lgbt rights'}
); 
INSERT INTO all_tags(dummy,tag) VALUES (1, 'philosophy');
INSERT INTO all_tags(dummy,tag) VALUES (1, 'religion');
INSERT INTO all_tags(dummy,tag) VALUES (1, 'catholicism');
INSERT INTO all_tags(dummy,tag) VALUES (1, 'roman catholicism');
INSERT INTO all_tags(dummy,tag) VALUES (1, 'liberal');
INSERT INTO all_tags(dummy,tag) VALUES (1, 'married priest');
INSERT INTO all_tags(dummy,tag) VALUES (1, 'lgbt rights');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.ikant', 'philosophy');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.ikant', 'religion');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.ikant', 'catholicism');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.ikant', 'roman catholicism');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.ikant', 'liberal');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.ikant', 'married priest');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.ikant', 'lgbt rights');

INSERT INTO belief_for_participant(participant_name, belief_name) VALUES ('person.ikant', 'Contemporary American Liberal Roman Catholicism');

--
-- 2. An old plan that failed review and aborted
-- 

-- 2a. Create the old plan
INSERT INTO plan (name, description, creation_ts, mission_statement, tags, beliefs, roles, state) 
VALUES(
'Holy Roads', 
'Keep roads and highways safe and friendly', 
dateof(now()), 
'My wife and I want safer and friendlier roads. We are road ragers, each of us, but we want to learn to "love enemy cars" and to stop regarding those cars as obstacles.',
{'love thy enemy','facticity','golden rule','road rage','safe roads','philosophy', 'existentialism','philosophy', 'religion', 'catholicism', 'roman catholicism', 'liberal', 'married priest', 'lgbt rights'}, 
{'Sartrean Existentialism', 'Contemporary American Liberal Roman Catholicism'}, 
{'person.mhavey':{'founder','actor'}, 'person.pjofre':{'founder', 'actor'}, 'object.roads': {'recipient'}},
'ACTIVE'
);

INSERT INTO plan_for_participant (participant_name, role, plan_name) VALUES ('person.mhavey', 'founder', 'Holy Roads');
INSERT INTO plan_for_participant (participant_name, role, plan_name) VALUES ('person.mhavey', 'actor', 'Holy Roads');
INSERT INTO plan_for_participant (participant_name, role, plan_name) VALUES ('person.pjofre', 'founder', 'Holy Roads');
INSERT INTO plan_for_participant (participant_name, role, plan_name) VALUES ('person.pjofre', 'actor', 'Holy Roads');
INSERT INTO plan_for_participant (participant_name, role, plan_name) VALUES ('object.roads', 'recipient', 'Holy Roads');

INSERT INTO all_tags(dummy,tag) VALUES (1, 'love thy enemy');
INSERT INTO all_tags(dummy,tag) VALUES (1, 'facticity');
INSERT INTO all_tags(dummy,tag) VALUES (1, 'golden rule');
INSERT INTO all_tags(dummy,tag) VALUES (1, 'road rage');
INSERT INTO all_tags(dummy,tag) VALUES (1, 'safe roads');

INSERT INTO my_tags(participant_name, tag) VALUES ('person.mhavey', 'love thy enemy');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.mhavey','facticity');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.mhavey','golden rule');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.mhavey','road rage');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.mhavey','safe roads');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.pjofre', 'love thy enemy');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.pjofre','facticity');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.pjofre','golden rule');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.pjofre','road rage');
INSERT INTO my_tags(participant_name, tag) VALUES ('person.pjofre','safe roads');

-- 2b. Add the first action
UPDATE plan SET actions = actions + [{
action_type: 'words', 
action_ts: dateof(now()), 
description: 'swore at a honda who cut me off', 
roles: {'person.mhavey':{'actor'}, 'object.honda':{'recipient'}}
}]
WHERE name='Holy Roads';

-- 2c. Add the second action
UPDATE plan SET actions = actions + [{
action_type: 'issued kill order', 
action_ts: dateof(now()), 
description: 'understood frustration and asked MI6 to delete the honda', 
roles: {'person.pjofre':{'actor'}, 'object.honda':{'recipient'}}
}]
WHERE name='Holy Roads';

-- 2d. Do a review
UPDATE plan SET reviews = reviews + [{
description: 'This is a disaster. Some good actions happened but were not logged, but the incident that was logged is terrible.',
review_ts: dateof(now()),
grade: 0.04,
goodness: 0.0,
benefit: 0.3,
progress: 0.001,
comments: 'See description. Note that the kill order was absolved in confession.',
exceptions: ['Halt the plan until re-reading Sartre', 'Pay $1000 to family of Honda'],
roles: {'person.judgejudy': {'reviewer'}, 'person.mhavey': {'reviewier', 'blamee', 'fixer'}, 'person.pjofre': {'blamee', 'fixer'}}
}]
WHERE name='Holy Roads';

-- 2e. Close it down
UPDATE plan SET end_ts = dateof(now()), state='ABORTED' 
WHERE name='Holy Roads';


--
-- 3. Revision of the road plan.
-- 

INSERT INTO plan (name, description, creation_ts, mission_statement, tags, beliefs, roles, state, related_plans) 
VALUES(
'Mostly Holy Roads', 
'Keep roads and highways safe and friendly, but allow one minute of vulgarity per week.', 
dateof(now()), 
'My wife and I want safer and friendlier roads. We are road ragers, each of us, but we want to learn to "love enemy cars" and to stop regarding those cars as obstacles. To keep it human, we allow ourselves to swear at other drivers one minute per week.',
{'love thy enemy','facticity','golden rule','road rage','safe roads','philosophy', 'existentialism','philosophy', 'religion', 'catholicism', 'roman catholicism', 'liberal', 'married priest', 'lgbt rights'}, 
{'Sartrean Existentialism', 'Contemporary American Liberal Roman Catholicism'}, 
{'person.mhavey':{'founder','actor'}, 'person.pjofre':{'founder', 'actor'}, 'object.roads': {'recipient'}},
'ACTIVE', 
{{plan_name: 'Holy Roads', relationship_type:'revision'}}
);

UPDATE plan SET related_plans = related_plans + {{plan_name: 'Mostly Holy Roads', relationship_type:'revision'}}
WHERE name='Holy Roads';

INSERT INTO plan_for_participant (participant_name, role, plan_name) VALUES ('person.mhavey', 'founder', 'Mostly Holy Roads');
INSERT INTO plan_for_participant (participant_name, role, plan_name) VALUES ('person.mhavey', 'actor', 'Mostly Holy Roads');
INSERT INTO plan_for_participant (participant_name, role, plan_name) VALUES ('person.pjofre', 'founder', 'Mostly Holy Roads');
INSERT INTO plan_for_participant (participant_name, role, plan_name) VALUES ('person.pjofre', 'actor', 'Mostly Holy Roads');
INSERT INTO plan_for_participant (participant_name, role, plan_name) VALUES ('object.roads', 'recipient', 'Mostly Holy Roads');

