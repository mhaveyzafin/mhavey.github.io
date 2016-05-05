% generic DFS algorithm. Walk through the possible moves until goal found 
dfs(_, Goal, S, Path, Path) :- call(Goal, S). 
dfs(Move, Goal, S, Checked, Path) :-
    % try a move
    call(Move, S, S2),

    % ensure the resulting state is new
    \+member(S2, Checked),

    % and that this state leads to the goal
    dfs(Move, Goal, S2, [S2|Checked], Path).


%
% Represent a state as a list with two sublists. First sublist represents left side of the river.
% Second sublist represents right side of the river.
%

% goal is no one left on the left side
wgcGoal([[],_]).

% move - man always alternates between left and right; he can take zero or one object with him.
% he can't leave the following pairs on the other side: (wolf,goat), (goat,cabbage)

% move 1 - man only moves left to right.
wgcMove([[man|Left],Right],[Left,[man|Right]]) :- safety(Left).

% move 2 - man only moves right to left.
wgcMove([Left,[man|Right]],[[man|Left],Right]) :- safety(Right).

% move 3 - man and some other object moves left to right
wgcMove([[man|Left],Right],[NewLeft,[man|NewRight]]) :- 
	selectPassengers(Left,NewLeft,Right,NewRight),
	safety(NewLeft).

% move 4 - man and some other object moves right to left
wgcMove([Left,[man|Right]],[[man|NewLeft],NewRight]) :- 
	selectPassengers(Right,NewRight,Left,NewLeft),
	safety(NewRight).

% select a passengers to move from departure to arrival
selectPassengers(Departure,NewDeparture,Arrival,NewArrival) :-
	member(Object,Departure),
	delete(Departure,Object,NewDeparture),
	append(Arrival,[Object],NewArrivalUnsorted),
	sort(NewArrivalUnsorted,NewArrival).

% check a side unattended by the man is safe
safety(Side) :-
	noPair(Side,wolf,goat),
	noPair(Side,goat,cabbage).

% count of item in list.
hasElem(_, [], 0) :- !. 
hasElem(X, [X|_], 1). 
hasElem(X, [Y|T], N) :- 
    X \= Y,          
    hasElem(X, T, N).  

% check the side does NOT have both the objects	
noPair(Pair,Object1,Object2) :- 
	hasElem(Object1,Pair,O1Count),
	hasElem(Object2,Pair,O2Count),
	Total is O1Count + O2Count,
	Total < 2.
	
% main search predicate
wgcSearch(Path) :-
	InitState = [[man,wolf,goat,cabbage],[]],
	dfs(wgcMove, wgcGoal, InitState, [InitState], RevPath),
	% dfs algorithm gives path from last to first, reverse it to give forward path back to caller
	reverse(RevPath,Path).
