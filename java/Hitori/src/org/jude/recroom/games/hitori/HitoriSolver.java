package org.jude.recroom.games.hitori;

import java.util.List;

import org.jude.recroom.games.hitori.HitoriBoard.Move;

/**
 * Hitori solver. 
 * @author Tibcouser
 * 
 * 
 *
 */
public class HitoriSolver {

	public static void main(String[] args) {
		// To use your board, set sx to your board's array 
		int sx[] = null;
		if (args.length == 1) {
			// the option of specifying the board from the command line
			
			String toks[] = args[0].split(" ");
			if (toks == null || toks.length == 0) {
				throw new RuntimeException("Illegal board. Use space delimited int list.");
			}
			int squareArgs[] = new int[toks.length];
			for (int i = 0; i < toks.length; i++) {
				squareArgs[i] = Integer.parseInt(toks[i]);
			}
			sx = squareArgs;
		}
		else if (args.length > 1) {
			throw new RuntimeException("Expected zero or one arguments");
		}
		else {
			// this is what i use; construct a board programmatically and change set sx=<that board>
			// good if you're building and coding constantly.
			int squares0 [] = {
					2 ,5 ,6 ,3 ,8 ,10,7 ,4 ,13,6 ,14,15,9 ,4 ,1 ,
					3 ,1 ,7 ,12,8 ,4 ,10,4 ,4 ,11,5 ,13,4 ,9 ,2 ,
					4 ,14,10,10,14,5 ,11,1 ,6 ,2 ,7 ,11,13,15,12,
					5 ,10,2 ,5 ,13,3 ,8 ,5 ,9 ,7 ,4 ,10,6 ,10,2 ,
					1 ,6 ,8 ,15,10,7 ,4 ,2 ,15,14,9 ,3 ,3 ,11,4 ,
					6 ,14,3 ,11,2 ,4 ,9 ,5, 7, 13,12,8 ,10,14,1 ,
					12,8 ,14,11,3 ,7 ,15,13,10,7 ,12,13,5 ,2 ,13,
					11,4 ,12,15,5 ,6 ,5 ,3 ,15,10,7 ,9 ,5 ,13,14,
					8 ,15,4 ,6 ,15,3 ,13,14,6 ,12,10,1 ,11,3 ,5 ,
					15,15,9 ,12,1 ,8 ,11,10,2 ,2 ,11,9 ,4 ,12,2 ,
					7 ,1 ,9 ,9 ,10,5 ,3 ,11,13,6 ,7 ,4 ,12,5 ,8 ,
					14,10,13,4 ,12,15,11,10,5 ,7 ,8 ,12,5 ,3 ,6 ,
					5 ,10,11,5 ,11,14,14,15,8 ,13,13,2 ,7 ,9 ,9 ,
					9 ,7 ,15,10,12,11,8 ,6 ,1 ,5 ,7 ,14,13,1 ,3 ,
					6 ,9 ,1 ,13,6 ,4 ,12,7 ,14,4 ,2 ,1 ,3 ,8 ,12
				};
				int squares1[] = { 
					3, 4, 8, 4, 3, 7, 8, 5, 
					3, 5, 5, 6, 1, 1, 4, 8, 
					4, 5, 6, 8, 1, 6, 8, 1, 
					8, 7, 1, 8, 4, 5, 3, 6, 
					8, 6, 6, 3, 4, 4, 3, 1, 
					1, 3, 2, 3, 6, 2, 1, 6, 
					1, 8, 8, 4, 5, 2, 6, 7,
					4, 1, 4, 2, 6, 6, 1, 3 };
				int squares2[] = { 
					4,2,2,4,6, 
					4,1,2,5,6, 
					3,3,1,6,4, 
					2,4,5,2,3,
					4,5,2,3,2 };
				int squares3[] = { 
					1,1,2, 
					1,3,2,
					2,3,1 };
				int squares4[] = {
					3,4,8,4,3,7,8,5,
					3,5,5,6,1,1,4,8,
					4,5,6,8,1,6,8,1,
					8,7,1,8,4,5,3,6,
					8,6,6,3,4,4,3,1,
					1,3,2,3,6,2,1,6,
					1,8,8,4,5,2,6,7,
					4,1,4,2,6,6,1,3
				};
				int squares5[] = {
					2,4,5,8,6,2,8,3,
					3,3,7,7,4,2,1,1,
					7,5,4,5,2,4,3,8,
					8,8,6,4,2,5,2,6,
					5,1,2,3,8,6,5,1,
					4,1,2,2,8,8,7,6,
					8,6,7,5,1,8,6,4,
					3,6,1,8,4,4,5,8
				};
				int squares5a[] = {
					2,2,2,2,6,2,8,3,
					3,3,7,7,4,2,1,1,
					7,5,4,5,2,4,3,8,
					8,8,6,4,2,5,2,6,
					5,1,2,3,8,6,5,1,
					4,1,2,2,8,8,7,6,
					8,6,7,5,1,8,6,4,
					3,6,1,8,4,4,5,8
				}; 
				int squares6[] = {
					2,2,1,5,3,
					2,3,1,4,5,
					1,1,1,3,5,
					1,3,5,4,2,
					5,4,3,2,1
				};			
				sx = squares0;
		}
		
			
		
		HitoriBoard board = new HitoriBoard(sx);
		List<Move> path = board.solveBoard();
		if (path == null) {
			System.out.println("No solution");
		}
		else {
			System.out.println("Solution - " + path.get(path.size() -1));
			System.out.println("\nPath" + path);
			
		}		
	}
}
