highFive2Match(S) :-
	% the solution set
	S=[[edwina,EFloor,ECo,EBiz],[keith,KFloor,KCo,KBiz],[ogden,OFloor,OCo,OBiz],[trish,TFloor,TCo,TBiz],[zed,ZFloor,ZCo,ZBiz]],

	% Clue 2, Declare facts, This helps to narrow.
	KFloor is 45, % clue 2
	TBiz=public, % clue 2
	
	% Clue 1
	member([_,44,brierwood,_],S),
	member(EFloor, [41,42,43,44,45]),
	member([_,NelsonFloor,nelson,_], S), NelsonFloor is EFloor-1,
	member([_,AcctFloor,_,accounting], S), AcctFloor is EFloor+1,

	% Clue 2
	permutation([EFloor,KFloor,OFloor,TFloor,ZFloor],[41, 42, 43, 44, 45]),	% bound the floor counts
	ZFloor is OFloor + 1, 
	member([_,GlyphFloor,glyphtic,_],S), TFloor is GlyphFloor + 2, 
	
	% Clue 3
	member([_,_,glyphtic,GlyphBiz],S), member([_,_,thebes,ThebesBiz],S), 
	permutation([GlyphBiz,ThebesBiz], [literary,web]),
	member([_,WebFloor,_,web],S), WebFloor\==41,

	% the intro to the puzzle mentions "watershed" and "realesate", which are not mentioned in the clues
	member(watershed, [ECo,KCo,OCo,TCo,ZCo]),
	member(realestate, [EBiz,KBiz,OBiz,TBiz,ZBiz]).

	