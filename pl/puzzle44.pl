% This code is old. 
% Version 1.0 of this code will be available on May 5. 

heartStrings44Match(S) :-
	% the solution set; a list of (person,music)
	S=[[Ha,M1],[Hb,M1],[Hc,M2],[Hd,M2],[He,M3],[Hf,M3],[Hg,M4],[Hh,M4],[Hi,M5],[Hj,M5],[Hk,M6],[Hl,M6],[Hm,M7],[Hn,M7]],

	% Need to set allowed values for music, and also noel is not mentioned in any clues.	
	permutation([beethoven,chopin,mozart,brahms,debussy,pachelbel,vivaldi], [M1,M2,M3,M4,M5,M6,M7]),
	member(noel, [Ha,Hb,Hc,Hd,He,Hf,Hg,Hh,Hi,Hj,Hk,Hl,Hm,Hn]),
	
	% Clue 1
	nth0(JordanPos,S,[jordan,JordanMusic]),
	sisterInLaw(JordanPos,SilPos),	
	nth0(SilPos,S,[_,SilMusic]),
	permutation([JordanMusic,SilMusic],[pachelbel,beethoven]),
		
	% Clue 2
	nth0(LeePos,S,[lee,debussy]),
	nth0(AriPos,S,[ari,_]),
	sibling(LeePos,AriPos),
	nth0(SidneyPos,S,[sidney,_]),
	parent(SidneyPos,SidneySonPos),
	male(SidneySonPos),
	nth0(SidneySonPos,S,[_,beethoven]),
	
	% Clue 3
	nth0(_,S,[hunter,chopin]),
	nth0(DrewPos,S,[drew,_]),
	spouse(DrewPos,TerryPos),
	nth0(TerryPos,S,[terry,_]),
	nth0(BlairPos,S,[blair,_]),
	sibling(DrewPos,BlairPos),
		
	% Clue 4
	nth0(QuinnPos,S,[quinn,_]),
	QuinnPos\==10,
	sibling(QuinnPos,QBroPos), male(QBroPos),
	sibling(QuinnPos,QSisPos), female(QSisPos),
	nth0(MadisonPos,S,[madison,_]),
	sibling(MadisonPos,MPos1), female(MPos1),
	sibling(MadisonPos,MPos2), female(MPos2),
	MPos1\==MPos2,
	nth0(PatPos,S,[pat,PatMusic]), member(PatMusic, [beethoven,chopin,mozart,brahms,debussy,pachelbel]),
	parent(PatPos,PatKidPos), female(PatKidPos),

	% Clue 5
	spouse(AriPos,BlairPos),
	nth0(AriPos,S,[ari,mozart]),
	nth0(ChrisPos,S,[chris,ChrisMusic]), member(ChrisMusic, [beethoven,chopin,mozart,vivaldi,debussy,pachelbel]),
	nth0(RobinPos,S,[robin,_]),
	permutation([AriPos,BlairPos],[SonOfRobinPos,SonOfChrisPos]),
	parent(RobinPos,SonOfRobinPos),parent(ChrisPos,SonOfChrisPos), 
	!.

% N is female or male			
female(N):- member(N,[0,2,4,6,8,10,12]).
male(N):- member(N,[1,3,5,7,9,11,13]).
	
% A is parent of B
parent(0,5). parent(1,5). parent(0,6). parent(1,6). parent(0,8). parent(1,8).
parent(2,9). parent(3,9). parent(2,10). parent(3,10). parent(2,12). parent(3,12).
	
% A and B are siblings
sibling(A,B):-parent(P,A),parent(P,B), A\==B.

% A is B's spouse
spouse(A,B) :- female(A), succ(A,B).
spouse(A,B) :- male(A), succ(B,A).

% A is sister in law of B
% sister in law: my spouse's sister
sisterInLaw(4,6). sisterInLaw(6,4).
sisterInLaw(4,8). sisterInLaw(8,4).
sisterInLaw(7,8). sisterInLaw(8,7).
sisterInLaw(8,10). sisterInLaw(10,8).
sisterInLaw(8,12). sisterInLaw(12,8).
sisterInLaw(11,12). sisterInLaw(12,11).
%sisterInLaw(Her,Me):- female(Her),spouse(Her,Bro),male(Bro),sibling(Me,Bro).
%sisterInLaw(Me,Her):- spouse(Her,Me).
