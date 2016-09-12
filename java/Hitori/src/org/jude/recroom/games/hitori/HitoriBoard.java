package org.jude.recroom.games.hitori;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents Hitori board. Each square is a number. Board must be square
 * 
 * 
 * @author Tibcouser
 *
 */
public class HitoriBoard {

	/**
	 * Represents a move in the solution: state + flip pos
	 * 
	 * @author Tibcouser
	 *
	 */
	public static class Move {
		StringBuffer state;
		int flipPos;
		HitoriBoard board;

		public Move(StringBuffer state, int flipPos, HitoriBoard board) {
			this.state = state;
			this.flipPos = flipPos;
			this.board = board;
		}

		public StringBuffer getState() {
			return state;
		}

		public int getFlipPos() {
			return flipPos;
		}

		public String toString() {
			return board.nicePrint(state, flipPos);
		}
	}

	int length;
	int dim;
	int squares[];
	int longestSq;
	boolean checkUniqueness = false;
	List<Move> solutionPath = null;
	List<Move> altSolutionPath = null;

	public HitoriBoard() {
	}

	public HitoriBoard(int squares[]) {
		setSquares(squares);
	}

	public int getLength() {
		return length;
	}

	public int getDim() {
		return dim;
	}

	public int[] getSquares() {
		return squares;
	}

	public boolean isCheckUniqueness() {
		return checkUniqueness;
	}

	public void setCheckUniqueness(boolean checkUniqueness) {
		this.checkUniqueness = checkUniqueness;
	}

	public List<Move> getSolutionPath() {
		return solutionPath;
	}

	public List<Move> getAltSolutionPath() {
		return altSolutionPath;
	}

	public void setSquares(int squares[]) {
		this.squares = squares;
		this.length = this.squares.length;
		this.dim = (int) (Math.sqrt((double) (this.length)));
		if (this.dim * this.dim != this.length) {
			throw new RuntimeException("Board is not square");
		}
		this.longestSq = 0;
		for (int i = 0; i < squares.length; i++) {
			this.longestSq = Math.max(longestSq, ("" + squares[i]).length());
			if (squares[i] <= 0 || squares[i] > this.dim) {
				System.err.println("WARNING: Square " + squares[i]
						+ " not in expected range");
			}
		}
	}

	/**
	 * Find the solution to the specified board. Returns the solution path. Each
	 * item in the path is an array of length n**2 of values (o, u, d, q). u =
	 * the square is unique (i.e., included in the solution). d = the square is
	 * deleted o = the square is open (i.e., being assessed for inclusion in the
	 * solution) q = the square is queued for uniqueness
	 */
	public List<Move> solveBoard() {
		// initial state is all o's
		StringBuffer state = new StringBuffer();
		for (int i = 0; i < this.length; i++) {
			state.append('o');
		}
		Move initialMove = new Move(state, -1, this);
		List<Move> path = new ArrayList<Move>();
		path.add(initialMove);

		// solve from this initial state
		if (solve(state, path, 0)) {
			return path;
		} else {
			return null;
		}
	}

	/**
	 * Main recursive solver. We begin at the specified state and try to reach
	 * the goal. The goal is no 'o' squares (i.e., every square is 'u' or 'd').
	 * If we are not at the goal, flip and 'o' to a 'u', delete duplicates in
	 * same row/col, and flip the neighbors of each deleted square. From this
	 * new state, recurisively solve.
	 * 
	 * @param state
	 * @param path
	 * @return
	 */
	boolean solve(StringBuffer state, List<Move> path, int level) {

		int oidx = state.indexOf("o");

		// if no o's left, we done!
		if (oidx < 0) {
			return true;
		}

		for (int j = 0; j < 2; j++) {
			boolean umode = (j == 0);

			// try to flip this o and then all q's squares; if can't flip, we'll
			// try the next o
			StringBuffer newState = new StringBuffer(state);
			if (!flipAndFollow(newState, oidx, umode)) {
				continue;
			}

			// we have a valid state after flipping the q's.
			// check we have no island
			if (hasIsland(newState)) {
				continue;
			}

			// ok, recursively solve from here
			path.add(new Move(newState, oidx, this));
			if (solve(newState, path, level + 1)) {
				return true;
			} else {
				path.remove(newState);
			}
		}

		return false; 
	}

	/**
	 * Flip the square at idx from o to u or d, and then flip all q's squares to
	 * u Return false if not possible to do so.
	 * 
	 * @param state
	 * @param idx
	 * @return
	 */
	boolean flipAndFollow(StringBuffer state, int idx, boolean umode) {
		// try to flip the o to u or d at idx
		if (umode) {
			if (!flip(state, idx)) {
				return false;
			}
		} else {
			if (!dflip(state, idx)) {
				return false;
			}
		}

		// successfully flipped; now take care of all queued squares
		while (true) {
			boolean atLeastOneQ = false;
			for (int j = 0; j < state.length(); j++) {
				if (j != idx && state.charAt(j) == 'q') {
					atLeastOneQ = true;
					if (!flip(state, j)) {
						return false;
					}
				}
			}

			// no nore q's
			if (!atLeastOneQ) {
				return true;
			}
		}
	}

	/**
	 * Given the state, flip the square at idx to 'u'. For each duplicate square
	 * in the same row/col, flip to 'd'. And for each neighbor of that 'd', flip
	 * to 'q'. If this cannot be done, return false.
	 * 
	 * @param state
	 * @param idx
	 * @return
	 */
	boolean flip(StringBuffer state, int idx) {

		// flip the square
		state.setCharAt(idx, 'u');

		// specify start, incr for row and column of idx
		int rowStart = this.dim * (idx / this.dim);
		int rowIncr = 1;
		int rowEnd = rowStart + this.dim;
		int colStart = (idx % this.dim);
		int colIncr = this.dim;
		int colEnd = this.length;
		int rowColParams[] = { rowStart, rowIncr, rowEnd, colStart, colIncr,
				colEnd };

		for (int rci = 0; rci < 6; rci += 3) {

			for (int i = rowColParams[rci]; i < rowColParams[rci + 2]; i += rowColParams[rci + 1]) {

				// skip the square we're on obviously; and only care if
				// duplicate
				if (i == idx || this.squares[idx] != this.squares[i]) {
					continue;
				}

				// oh oh; can't delete these!
				if (state.charAt(i) == 'u' || state.charAt(i) == 'q') {
					return false;
				}

				// flip to 'd'
				if (!dflip(state, i)) {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Flip square at specified idx to 'd'. Queue neighbors if necesary
	 * 
	 * @param state
	 * @param idx
	 * @return
	 */
	boolean dflip(StringBuffer state, int idx) {
		// flip the square
		state.setCharAt(idx, 'd');

		// turn each neighbor; queue these for flip
		int north = idx - this.dim;
		int south = idx + this.dim;
		if (south >= this.length)
			south = -1;
		int east = idx - 1;
		if ((idx % this.dim) == 0)
			east = -1;
		int west = idx + 1;
		if ((idx % this.dim) == this.dim - 1)
			west = -1;
		int neighbors[] = { north, south, east, west };
		for (int j = 0; j < neighbors.length; j++) {
			if (neighbors[j] < 0)
				continue;

			switch (state.charAt(neighbors[j])) {
			case 'd':
				return false;
			case 'o':
				state.setCharAt(neighbors[j], 'q');
				break;
			default:
				// else - nothing to do; will be u or q already; no need
				// to change
				break;
			}
		}
		return true;
	}

	/**
	 * Return true if the board in the specified state contains an "island"
	 * Island: A path of deleted squares can be traced from an edge to an edge,
	 * thereby creating an "island" of undeleted squares.
	 */
	boolean hasIsland(StringBuffer state) {
		// mark every square unvisited
		boolean visited[] = new boolean[state.length()];
		for (int i = 0; i < state.length(); i++) {
			visited[i] = false;
		}

		// start walking from any UNVISITED, DELETED edge square; if we can walk
		// to another deleted edge, we've found an island
		for (int i = 0; i < state.length(); i++) {
			if (!visited[i] && state.charAt(i) == 'd' && isEdgeSquare(i)) {
				visited[i] = true;
				if (islandWalk(state, visited, i)) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Try to traverse a zig-zag path of deleted squares on the board in the
	 * given state from the specified square idx. Return true if a path can be
	 * found (which creates an island). Use visited array to prevent iterating
	 * twice over the same square. Walk recurisvely.
	 */
	boolean islandWalk(StringBuffer state, boolean visited[], int idx) {

		int nw = idx - (this.dim + 1);
		if (idx < this.dim || (idx % this.dim) == 0)
			nw = -1;
		int ne = idx - this.dim + 1;
		if (idx < this.dim || (idx % this.dim) == this.dim - 1)
			ne = -1;
		int sw = idx + this.dim - 1;
		if (idx >= this.dim * (this.dim - 1) || (idx % this.dim) == 0)
			sw = -1;
		int se = idx + this.dim + 1;
		if (idx >= this.dim * (this.dim - 1)
				|| (idx % this.dim) == this.dim - 1)
			se = -1;
		int neighbors[] = { nw, ne, sw, se };
		// look in each neighbor direction
		for (int i = 0; i < neighbors.length; i++) {
			// skip if can't go that way or already visited or open square
			if (neighbors[i] < 0 || visited[neighbors[i]]
					|| state.charAt(neighbors[i]) != 'd') {
				continue;
			}

			// if the neighbor is an edge, we've traced the path! we have island
			if (isEdgeSquare(neighbors[i])) {
				return true;
			}

			// mark square visited and keep walking from neighbor onwards
			visited[neighbors[i]] = true;
			if (islandWalk(state, visited, neighbors[i])) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Return true if square at pos i in the board is an edge square
	 */
	boolean isEdgeSquare(int i) {
		return i >= 0
				&& i < this.length
				&& (i < this.dim || i >= this.dim * (this.dim - 1)
						|| (i % this.dim) == 0 || (i % this.dim) == this.dim - 1);
	}

	/**
	 * Prints board state
	 * 
	 */
	String nicePrint(StringBuffer state, int flipPos) {
		String output = "\n";
		for (int i = 0; i < this.length; i++) {
			if (i > 0 && (i % this.dim) == 0) {
				output += "\n";
			}
			output += String
					.format("%" + this.longestSq + "s", this.squares[i]);
			if (i == flipPos) {
				// if this is the square we flipped, show the state in UPPER
				// CASE
				output += ("" + state.charAt(i)).toUpperCase();
			} else {
				output += state.charAt(i);
			}
			output += " ";
		}
		return output;
	}
}
