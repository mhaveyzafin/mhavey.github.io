% generic DFS algorithm. Walk through the possible moves until goal found 
dfs(_, Goal, S, Path, Path) :- call(Goal, S). 
dfs(Move, Goal, S, Checked, Path) :-
    % try a move
    call(Move, S, S2),
    
    % ensure the resulting state is new
    \+member(S2, Checked),

    % and that this state leads to the goal
    dfs(Move, Goal, S2, [S2|Checked], Path).

% goal is no one left (empty sublist 1) on the left side
wgcGoal([[],_]). 

% move - man always alternates between left and right; he can take zero, one of two objects with him.
% he can't leave the following pairs on the other side: (wolf,goat), (goat,cabbage), (stick,wolf), (fire,stick).

% move 1a - man only moves left to right.
wgcMove([[man|Left],Right],[Left,[man|Right]]) :- safety(Left).

% move 1b - left to right with passengers
wgcMove([[man|Left],Right],[NewLeft,[man|NewRight]]) :- 
	choosePassengers(Left,Passengers),
	movePassengers(Passengers,Left,NewLeft,Right,NewRightUnsorted),
	sort(NewRightUnsorted,NewRight),
	safety(NewLeft).

% move 2a - man only moves right to left.
wgcMove([Left,[man|Right]],[[man|Left],Right]) :- safety(Right).

% move 2b - right to left with passengers
wgcMove([Left,[man|Right]],[[man|NewLeft],NewRight]) :- 
	choosePassengers(Right,Passengers),
	movePassengers(Passengers,Right,NewRight,Left,NewLeftUnsorted),
	sort(NewLeftUnsorted,NewLeft),
	safety(NewRight).
	
% choose 1 or 2 passengers to take across
choosePassengers([], []).
choosePassengers([A], [A]).
choosePassengers(Departures,Passengers) :-
	between(1,2,MaxPassengers),
	length(Departures,DepLen),	
	selectPassengers(Departures,MaxPassengers,DepLen,Passengers).
selectPassengers(Departures,1,DepLen,Passengers) :-
	Pos1Max is DepLen - 1,
	between(0,Pos1Max,Pos1),
	nth0(Pos1,Departures,Passenger),
	Passengers=[Passenger].
selectPassengers(Departures,2,DepLen,Passengers) :-
	Pos1Max is DepLen - 2,
	between(0,Pos1Max,Pos1),
	nth0(Pos1,Departures,Passenger1),
	Pos2Min is Pos1 + 1,
	Pos2Max is DepLen -1,
	between(Pos2Min,Pos2Max,Pos2),
	nth0(Pos2,Departures,Passenger2),
	Passengers=[Passenger1,Passenger2].

% move passengers to move from departure to arrival
movePassengers([],Departure,Departure,Arrival,Arrival).
movePassengers([P|Tail],Departure,NewDeparture,Arrival,NewArrival) :-
	delete(Departure,P,NewDeparture1),
	append(Arrival,[P],NewArrival1),
	movePassengers(Tail,NewDeparture1,NewDeparture,NewArrival1,NewArrival).

% check a side unattended by the man is safe
safety(Side) :-
	noPair(Side,stick,wolf), noPair(Side,fire,stick),
	noPair(Side,wolf,goat), noPair(Side,goat,cabbage).

% count of item in list.
hasElem(_, [], 0) :- !. 
hasElem(X, [X|_], 1). 
hasElem(X, [Y|T], N) :-  X \= Y, hasElem(X, T, N).  

% check the side does NOT have both the objects	
noPair(Pair,Object1,Object2) :- 
	hasElem(Object1,Pair,O1Count),
	hasElem(Object2,Pair,O2Count),	
	Total is O1Count + O2Count,
	Total < 2.
	
% main search predicate
wgcSearch(Path) :-
	InitState = [[man,cabbage,fire,goat,stick,wolf],[]], % sorted from man onwards!!
	dfs(wgcMove, wgcGoal, InitState, [InitState], RevPath),
	% dfs algorithm gives path from last to first, reverse it to give forward path back to caller
	reverse(RevPath,Path).
	