heartStrings44Match(S) :-
	% the solution set; a list of lists; each sublist is [man pos,woman pos, husband name, wife name, music]
	S=[[Ha,Hb,Ma],[Hc,Hd,Mc],[He,Hf,Me],[Hg,Hh,Mg],[Hi,Hj,Mi],[Hk,Hl,Mk],[Hm,Hn,Mm]],
	
	permutation([Ha,Hb,Hc,Hd,He,Hf,Hg,Hh,Hi,Hj,Hk,Hl,Hm,Hn],[noel,jordan,lee,ari,sidney,hunter,blair,terry,quinn,madison,pat,chris,robin,drew]),
	permutation([Ma,Mc,Me,Mg,Mi,Mk,Mm],[pachelbel,beethoven,debussy,chopin,vivaldi,mozart,brahms]),
	
	% Clue 1
	personPos(S,jordan,_,JordanMusic,JordanTreePos,JordonPos),
	sisterInLaw(JordanTreePos,JordanPos,SilTreePos,SilPos),
	personPos(S,_,_,SilMusic, SilTreePos,SilPos),
	permutation([JordanMusic,SilMusic],[pachelbel,beethoven]).
	
		% Clue 2
		personPos(S,lee,_,debussy,LeeTreePos,LeePos),
		personPos(S,ari,_,_,AriTreePos,AriPos),
		sibling(AirTreePos,AriPos,LeeTreePos,LeePos),
		personPos(S,sidney,_,_,SidneyTreePos,SidneyPos),
		parent(SidneyTreePos,SonTreePos,1),
		nth0(SonTreePos,S,[_,_,beethoven]),
		
		% Clue 3
		(member([hunter,_,chopin],S) ; member([_,hunter,chopin],S)),
		personPos(S,drew,terry,_,DrewTreePos,DrewPos),
		personPos(S,blair,_,_,BlairTreePos,BlairPos),
		sibling(DrewTreePos,DrewPos,BlairTreePos,BlairPos),
		
		% Clue 4
		
	
		% Clue 5
		AriPos==0->BlairPos=1;BlairPos=0,
		personPos(S,ari,blair,mozart,AriTreePos,AriPos),
		personPos(S,chris,_,ChrisMusic,ChrisTreePos,ChrisPos), ChrisMusic\==brahms,
		personPos(S,robin,_,_,RobinTreePos,RobinPos),
		(parent(ChrisTreePos,AriTreePos,AriPos);parent(ChrisTreePos,AriTreePos,BlairPos)),
		(parent(RobinTreePos,AriTreePos,BlairPos);parent(RobinTreePos,AriTreePos,AriPos)).

	

personPos(S,Spouse1,Spouse2,Music,Pos,Spouse1Pos) :- 
	(nth0(Pos,S,[Spouse1,Spouse2,Music]), Spouse1Pos is 0);  (nth0(Pos,S,[Spouse2,Spouse1,Music]), Spouse1Pos is 1).

sisterInLaw(2,0,3,0). sisterInLaw(3,0,2,0).
sisterInLaw(2,0,4,0). sisterInLaw(4,0,2,0).
sisterInLaw(4,0,5,0). sisterInLaw(5,0,4,0).
sisterInLaw(4,0,6,0). sisterInLaw(6,0,4,0).

parent(0,2,1). parent(0,3,0). parent(0,4,0).
parent(1,4,1). parent(1,5,0). parent(1,6,0).
	
sibling(2, 1, 3, 0). sibling(3, 0, 2, 1).
sibling(2, 1, 4, 0). sibling(4, 0, 2, 1).
sibling(3, 0, 4, 0). sibling(4, 0, 3, 0).

sibling(4, 1, 5, 0). sibling(5, 0, 4, 1).
sibling(4, 1, 6, 0). sibling(6, 0, 4, 1).
sibling(5, 0, 6, 0). sibling(6, 0, 5, 0).
