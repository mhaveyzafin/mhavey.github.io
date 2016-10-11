/*
Slitherlink. Here is a sample 6x6 board. 

Board = 
[
1,x,3,1,x,3,
x,x,x,3,x,x,
x,3,x,2,1,x,
x,0,2,x,1,x,
x,x,2,x,x,x,
2,x,2,3,x,3
], % 36 elements, the ones marked x are blanks
36, % num elements
6, % num cols
6 % num rows
]

Rules: Draw lines around squares subject to the following constraints:
1. Exactly zero lines around a square marked zero.
2. Exactly one line around a square marked one.
3. Exactly two lines around a square marked two.
4. Exactly three lines around a square marked three.
5. The lines must form a loop that never crosses itself. 

To solve, use slitherlinkSolution(Board,Path). Path is a list of items of the form [Pos,Lines], 
indicating that the square at position Pos has the specified Lines surrounding it. Pos is zero-based.
Lines is a list that can contains north, south, east, west.

Here is the solution for the above board:
[
[0, south], [1, south], [2, east, north, west], [3, west], [4, east], [5, east, north, west], 
[6, west, north], [7, north, south], [8, east], [9, east, west, south], [10, west, north], [11, east, south],
[12, east, west, south], [13, east, west, north], [14, west, south], [15, north, south], [16, east], [17, west, north, south],
[18, north, south], [20, north, south], [21, east, north, south], [22, west], [23, east, north, south],
[24, east, west, north], [25, east, west, south], [26, west, north], [27, north, south], [28, west], [29, west, north, south],
[30, west, south], [31, north, south], [32, west, south], [33, east, west, north], [34, south], [35, east, north, south]
]
*/

% Sample 6x6 board. The x squares are blanks.
samplegame(Path) :-
   Squares = [
1,x,3,1,x,3,
x,x,x,3,x,x,
x,3,x,2,1,x,
x,0,2,x,1,x,
x,x,2,x,x,x,
2,x,2,3,x,3
],
   Board=[Squares,36,6,6],
   slitherlinkSolution(Board,Path).

% Sample 8x8 board. The x squares are blanks.
samplegame2(Path) :-
   Squares = [
x,0,x,1,x,x,1,x,
x,3,x,x,2,3,x,2,
x,x,0,x,x,x,x,0,
x,3,x,x,0,x,x,x,
x,x,x,3,x,x,0,x,
1,x,x,x,x,3,x,x,
3,x,1,3,x,x,3,x,
x,0,x,x,3,x,3,x
],
   Board=[Squares,64,8,8],
   slitherlinkSolution(Board,Path).


% slitherlinkSolution(Board,Path)
slitherlinkSolution(Board, Path) :-
   surroundsAllNSquares(Board, 0, [[],[]], State1),
   surroundsAllNSquares(Board, 3, State1, State2),
   surroundsAllNSquares(Board, 1, State2, State3),
   surroundsAllNSquares(Board, 2, State3, [_,Inclusions]),
   niceInclusions(Board,Inclusions,Path).
   
% surroundsAllNSquares(Board,Val,PathIn,PathOut): We look for all squares in the board with value Val (which is 0, 1, 2, or 3).
% We decide how to surround them with lines: we include exactly Val lines and exclude the others. We track it in Path. PathIn is 
% where we started, PathOut is where we end up.
surroundsAllNSquares([[]|_],_,Path,Path).
surroundsAllNSquares([[N|Rest],Len,Width,Height],N,Path1,Path2) :-
   length(Rest,RestLen),
   Pos is Len - RestLen - 1,
   Row is Pos div Width,
   Col is Pos mod Width,
   NW is Row * (Col + 1) + Col,
   NE is NW + 1,
   SW is NW + (Width + 1),
   SE is SW + 1,
   surrounds(N,[NW,NE,SW,SE],Path1,PathN),
   surroundsAllNSquares([Rest,Len,Width,Height],N,PathN,Path2).
surroundsAllNSquares([[A|Rest],Len,Width,Height],N,Path1,Path2) :-
  \+(A=N),
  surroundsAllNSquares([Rest,Len,Width,Height],N,Path1,Path2).

% surrounds(Val,SurroundingDotsList,PathIn,PathOut: Surround a square with exactly Val number of lines (0, 1, 2, 3). Track the 
% included and excluded lines in Path. PathIn is where we start, PathOut is where we end up.
% Note about the dots: In mxn board, there are (m+1)x(n+1) dots. Each square is surrounded by four dots:
% one to the NW, one to the NE, one to the SW, one to the SE. 
surrounds(N,[NW,NE,SW,SE],Path1,Path2):-
   Lines=[[NW,NE],[NE,SE],[NW,SW],[SW,SE]],
   select(Line1, Lines, Linesa),
   select(Line2, Linesa, Linesb),
   select(Line3, Linesb, Linesc),
   select(Line4, Linesc, _),
   lineMarked(Line1, N, 0, Path1, Patha),
   lineMarked(Line2, N, 1, Patha, Pathb),
   lineMarked(Line3, N, 2, Pathb, Pathc),
   lineMarked(Line4, N, 3, Pathc, Path2).
   
% lineMarked(Line, Val, LineIdx, PathIn, PathOut); Include or exclude the specified line. Keep track in Path. Start at PathIn, end up at PathOut.
% Whether to include or exclude is based on comparison of Val and LineIdx. We include if LineIdx < Val and exclude otherwise. 
% Example:
% N = 2, LineIdx = 0 -> include
% N = 2, LineIdx = 1 -> include
% N = 2, LineIdx = 2 -> exclude
% N = 2, LineIdx = 3 -> exclude
lineMarked(L, N, LineIdx, PathIn, PathOut) :-
   LineIdx < N, lineIncluded(L, PathIn, PathOut).
lineMarked(L, N, LineIdx, PathIn, PathOut) :-
   LineIdx >= N, lineExcluded(L, PathIn, PathOut).
   
% lineExcluded(Line, PathIn, PathOut); Line can be added to exclusions.   
lineExcluded(L, [Ex,In], [Ex,In]) :-
   member(L,Ex), \+(member(L,In)).
lineExcluded(L, [Ex,In], [Ex2,In]) :-
   \+(member(L,Ex)), \+(member(L,In)),
   append([L],Ex,Ex2).

% lineIncluded(Line, PathIn, PathOut); Line can be added to inclusions.   
lineIncluded(L, [Ex,In], [Ex,In]) :-
   member(L,In), \+(member(L,Ex)).
lineIncluded([A,B], [Ex,In], [Ex,In2]) :-
   \+(member([A,B],Ex)), \+(member([A,B],In)),
   dotCheck(A,In,0,ACount), ACount < 3,
   dotCheck(B,In,0,BCount), BCount < 3,   
   append([[A,B]],In,In2).

% dotCheck(Dot,Inclusions,CountIn,CountOut): count of lines in Inclusions containing Dot
dotCheck(_,[],C,C).
dotCheck(Dot,[[Dot,_]|Rest],CountIn,CountOut) :-
   Count1 is CountIn + 1,
   dotCheck(Dot,Rest,Count1,CountOut).
dotCheck(Dot,[[_,Dot]|Rest],CountIn,CountOut) :-
   Count1 is CountIn + 1,
   dotCheck(Dot,Rest,Count1,CountOut).
dotCheck(Dot,[[A,B]|Rest],CountIn,CountOut) :-
   A=\=Dot, B=\=Dot,
   dotCheck(Dot,Rest,CountIn,CountOut).
   
   
% niceInclusions(Board, Inclusions,Path): converts inclusion list of lines between dots to the friendly notation. For example [0,1], [1,8] is converted to [0,north, east].
niceInclusions([_,Len,Width,Height],Inclusions,Path) :-
   niceInclusionsLoop(0,Len,Width,Height,Inclusions,[],Path).
niceInclusionsLoop(Len,Len,_,_,_,Path,Path).
niceInclusionsLoop(Pos,Len,Width,Height,Inclusions,PathIn,PathOut) :-   
   Row is Pos div Width,
   Col is Pos mod Width,
   NW is Row * (Col + 1) + Col,
   NE is NW + 1,
   SW is NW + (Width + 1),
   SE is SW + 1,
   (member([NW,NE],Inclusions) -> append([[Pos,north]],PathIn,PathNorth); append([],PathIn,PathNorth)),
   (member([NW,SW],Inclusions) -> append([[Pos,west]],PathNorth,PathWest); append([],PathNorth,PathWest)),
   (member([NE,SE],Inclusions) -> append([[Pos,east]],PathWest,PathEast); append([],PathWest,PathEast)),
   (member([SW,SE],Inclusions) -> append([[Pos,south]],PathEast,PathSouth); append([],PathEast,PathSouth)),
   
   NextPos is Pos + 1,
   niceInclusionsLoop(NextPos,Len,Width,Height,Inclusions,PathSouth,PathOut).
