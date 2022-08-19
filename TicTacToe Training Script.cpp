/*
Name: Jorge Perez
School: Hunter College
Course: CSCI 49900 (Advanced Applications: A capstone for Majors)

Project: Train two agents to learn how to play TicTacToe with Reinforcement Learning. One agent will learn how to play as "X", the second agent will learn how to play as "O".

*/


#include <unordered_map>
#include <iostream>
#include <array>
#include <vector>
#include <fstream>


using namespace std;


/*
Hash function for 3D arrays/matrices.
*/
struct ArrayHasher {
    size_t operator()(const array<array<int, 3>, 3>& board) const {
        size_t h = 0;

        for (int row = 0; row < 3; row++) {
            for (auto e : board[row]) {
                h ^= hash<int>{}(e)+0x9e3779b9 + (h << 6) + (h >> 2);
            }
        }

        return h;
    }
};

//TIC TAC TOE GAME
class Game
{

public:

    Game() : current_player(1) {}



    //RETURN VECTOR CONTAINING ALL OPEN MOVES/POSITIONS AT THE CURRENT BOARD STATE
    vector < pair<int, int> > Get_Moves() {
        vector<pair<int, int>> Open_Positions;

        //SEARCH FOR ALL OPEN POSITIONS
        for (int row = 0; row < 3; row++) {
            for (int column = 0; column < 3; column++) {
                if (Board[row][column] == 0) {
                    Open_Positions.push_back(make_pair(row, column));
                }
            }
        }

        //RETURN VECTOR WITH ALL OPEN POSITIONS
        return Open_Positions;

    }


    /*
    Returns an action that can either be randomly chosen or an action with the highest future value
    Returns: pair<row,column> 
    */
    pair<int, int> Get_Action(int eps, int randomAgent) {
        int epsilon = eps;


        pair<int,int> action;
        int number = rand() % 100;


        //Get vector that contains all open positions at the current state of the gaming board.
        vector < pair<int, int> > open_positions = Get_Moves();

        
        if (current_player == randomAgent) {
            int position = rand() % open_positions.size();

            action = open_positions[position];
        }
        //RANDOM ACTION IS CHOSEN
        else if (number < epsilon) {
            int position = rand() % open_positions.size();

            action = open_positions[position];

        }
        
        //ELSE: ACTION WITH THE HIGHEST FUTURE REWARD IS CHOSEN
        else {
            float max = INT_MIN;
            //PLAYER 1
            if (current_player == 1) {
                for (int position = 0; position < open_positions.size(); position++) {
                    array<array<int, 3>, 3> temporary_board = Board;
                    temporary_board[open_positions[position].first][open_positions[position].second] = 1;

                    float value = player_X[temporary_board];

                    if (value > max) {
                        max = value;
                        action = open_positions[position];
                    }
                }
            }
            //PLAYER -1
            else if (current_player == -1) {
                for (int position = 0; position < open_positions.size(); position++) {
                    array<array<int, 3>, 3> temporary_board = Board;
                    temporary_board[open_positions[position].first][open_positions[position].second] = -1;

                    float value = player_O[temporary_board];

                    if (value > max) {
                        max = value;
                        action = open_positions[position];
                    }
                }
            }
        }
        return action;
    }


    /*
    Update the position specified by 'action' with the current player's symbol (1 or -1)
    */
    void Update_Board(pair<int, int> action) {
        //PLAYER 1
        if (current_player == 1) {
            Board[action.first][action.second] = 1;
            moves_X.push_back(Board);
        }
        //PLAYER -1
        else if (current_player == -1) {
            Board[action.first][action.second] = -1;
            moves_O.push_back(Board);
        }
    }


    /*
    Function that takes the current game board and checks if there is a winner or if the game resulted in a tie.
    Returns 1 if player_X won the game
    Returns -1 if player_O won the game
    Returns 0 if there is a tie
    Returns 9999 if the current game hasn't concluded
    */
    int Winner() {
        int winner = 9999;
        
        int row_sum = 0;
        int column_sum = 0;
        int diagonal_sum_one = 0;
        int diagonal_sum_two = 0;
        for (int row = 0; row < 3; row++) {
            row_sum = 0;
            column_sum = 0;
            for (int column = 0; column < 3; column++) {
                row_sum += Board[row][column];
                column_sum += Board[column][row];
                if (row == column) {
                    diagonal_sum_one += Board[row][column];
                }
            }
            if (row_sum == 3 || column_sum == 3) {
                return 1;
            }
            else if (row_sum == -3 || column_sum == -3) {
                return -1;
            }
        }

        diagonal_sum_two = Board[0][2] + Board[1][1] + Board[2][0];

        if (diagonal_sum_one == 3 || diagonal_sum_two == 3) {
            return 1;
        }
        else if (diagonal_sum_one == -3 || diagonal_sum_two == -3) {
            return -1;
        }

        vector<pair<int, int>> moves = Get_Moves();
        if (moves.empty()) {
            return 0;
        }

        return winner;
    }



    int max(array<array<int, 3>, 3> state) {

        vector<pair<int, int>> open_positions;

        for (int row = 0; row < 3; row++) {
            for (int column = 0; column < 3; column++) {
                if (state[row][column] == 0) {
                    open_positions.push_back(make_pair(row, column));
                }
            }
        }

        if (open_positions.empty()) {
            return 0;
        }
        int max = INT_MIN;
        for (int position = 0; position < open_positions.size(); position++) {
            array<array<int, 3>, 3> temporary_board = Board;
            temporary_board[open_positions[position].first][open_positions[position].second] = 1;

            int value = player_X[temporary_board];

            if (value > max) {
                max = value;
                
            }
        }

        return max;
    }

    /*
    GIVE BOTH PLAYERS THEIR IMMIDIATE REWARD AT THE END OF EACH GAME,
    THEN UPDATE THE Q-TABLES FOR BOTH PLAYERS USING THE STATE-VALUE FUNCTION
    */
    void Update_Table(int winner, int randomAgent) {
        float d_factor = 0.8;
        float l_factor = 0.2;

        float reward_X = 0;
        float reward_O = 0;

        if (winner == 1) {
            reward_X = 1;
            reward_O = -1;
        }
        else if (winner == -1) {
            reward_X = -1;
            reward_O = 1;
        }
        else if(winner == 0) {
            reward_X = 0.1;
            reward_O = 0.8;
        }
        
        if (randomAgent == -1) {
            player_X[moves_X.back()] = reward_X;
            for (int sv = moves_X.size() - 2; sv >= 0; sv--) {
                player_X[moves_X[sv]] = player_X[moves_X[sv]] + l_factor * (d_factor * player_X[moves_X[sv + 1]] - player_X[moves_X[sv]]);
            }
        }

        if (randomAgent == 1) {
            player_O[moves_O.back()] = reward_O;
            for (int sv = moves_O.size() - 2; sv >= 0; sv--) {
                player_O[moves_O[sv]] = player_O[moves_O[sv]] + l_factor * (d_factor * player_O[moves_O[sv + 1]] - player_O[moves_O[sv]]);

            }
        }

        /*
        player_X[moves_X.back()] = reward_X;
        player_O[moves_O.back()] = reward_O;

        for (int sv = moves_X.size()-2; sv >= 0; sv--) {
            player_X[moves_X[sv]] = player_X[moves_X[sv]] + l_factor * (d_factor*player_X[moves_X[sv + 1]] - player_X[moves_X[sv]]);
        }
       
        for (int sv = moves_O.size()-2; sv >= 0; sv--) {
            player_O[moves_O[sv]] = player_O[moves_O[sv]] + l_factor * (d_factor*player_O[moves_O[sv + 1]] - player_O[moves_O[sv]]);
            
        }
        */

        moves_X.clear();
        moves_O.clear();

    }


    /*
        Function that trains the agent to learn how to play tictactoe 
    */
    void Train(string trainingAgent){
        srand(unsigned int(time(NULL)));
        cout << "TRAINING AGENT..." << endl;
        int EPISODES = 0;
        int winX = 0;
        int winO = 0;
        int draws = 0;

        int randomAgent = 0;
        int randomAgentLosses = 0;

        if (trainingAgent == "X") {
            randomAgent = -1;
        }
        else if (trainingAgent == "O") {
            randomAgent = 1;
        }
        

        while (EPISODES < 100000000) {
            bool END_GAME = false;
            /*
            if (EPISODES % 100000 == 0) {
                cout << EPISODES << endl;

            }
            */

            //FIRST TURN = AGENT
            //SECOND TURN = OPPONENT

            //The agent playing as "X" will always go first.
            current_player = 1;

            int moves = 0;
            while (!END_GAME) {
                pair<int, int> action;

                if (EPISODES == 2000000) {
                    winX = 0;
                    winO = 0;
                    draws = 0;
                }
                /*
                For the first 2,000,000 episodes the agents will train with an epsilon of 15%.
                After the episodes count is over 2,000,000, the agents will then start training with an epsilon of 0% (Agent in training will make no random moves and will only take moves with the highest future reward)
                At the same time the opponent of the agent in training will always make random moves. For example, if the agent playing as "X" is currently training then the agent playing as "O" will make random moves 
                100% of the time.
                */

                if (EPISODES >= 2000000 && moves == 0) {
                    action = Get_Action(100,randomAgent);
                    moves++;
                }
                else if(EPISODES >= 2000000 && moves != 0) {
                    action = Get_Action(0,randomAgent);
                    moves++;
                }
                else {
                    action = Get_Action(15, randomAgent);

                }

                //This updates the current game board after the best or random action has been calculated.
                Update_Board(action);

                //Check the current board for an ending result, a winner or a draw.
                int winner = Winner();

                if (winner != 9999) {
                    END_GAME = true;
                    array<array<int, 3>, 3> reset = { 0 };
                    Board = reset;

                    //Update Q-Tables, will not update the Q-Table of the randomAgent making 100% random moves.
                    Update_Table(winner, randomAgent);
                    if (winner == 1) {
                        winX++;
                    }
                    else if (winner == -1) {
                        winO++;
                    }
                    else if (winner == 0) {
                        draws++;
                    }

                    /*
                    When the agent in training starts making no random moves, this part will keep track of all the times the random agent(the opponent of the agent in training) doesn't win a game.
                    The agent in training will continue to train until the opponent does not win for 1,000,000 games in a row. This is to ensure that there is no possible way for the opponent to win a single game.
                    Everytime the opponent does end up winning a game then the agent in training is punished and the counter resets to 0.
                    */
                    if (EPISODES >= 2000000 && winner != randomAgent) {
                        randomAgentLosses++;
                    }
                    else if (EPISODES >= 2000000 && winner == randomAgent) {
                        randomAgentLosses = 0;
                    }

                    cout << "X: " << winX << "    O: " << winO << endl;
                    cout << "DRAW: " << draws << " TRAINING: " << trainingAgent << endl << endl;
                    
                    
                }
                /*
                CHANGE TURNS
                If current_player == 1 it's the opponents turn (PLAYER -1), ELSE it's the main agent's turn (PLAYER 1)
                */
                if (current_player == 1) {
                    current_player = -1;
                }
                else {
                    current_player = 1;
                }
            }
           
            if (randomAgentLosses == 1000000) {
                EPISODES = 100000000;
            }
            EPISODES++;
            
        }
    }


    /*
        Function that allows the user to play against the trained agent
    */
    void Face_Agent() {
        bool play = true;
        while (play) {
            array<array<int, 3>, 3> reset = { 0 };
            Board = reset;

            bool END_GAME = false;
            current_player = 1;
            while (!END_GAME) {

                //Agent's turn
                if (current_player == 1) {
                    cout << endl;
                    float max = INT_MIN;
                    vector < pair<int, int>> open_positions = Get_Moves();
                    pair<int, int> action;

                    for (int position = 0; position < open_positions.size(); position++) {
                        array<array<int, 3>, 3> temporary_board = Board;
                        temporary_board[open_positions[position].first][open_positions[position].second] = 1;
                        

                        float value = player_X[temporary_board];
                        if (value > max) {
                            max = value;
                            action = open_positions[position];

                        }
                    }
                    Update_Board(action);
                }

                //User's turn 
                else if (current_player == -1) {
                    cout << "Your turn:" << endl;
                    int x, y = 0;
                    cout << "Enter row: ";
                    cin >> x;
                    cout << "Enter column: ";
                    cin >> y;
                    cout << endl;
                    while (x > 2 || y > 2) {
                        cout << "Invalid Action!" << endl;
                        cout << "Enter row: ";
                        cin >> x;
                        cout << "Enter column: ";
                        cin >> y;
                    }
                    cout << endl;
                    pair<int, int> action = make_pair(x, y);

                    Update_Board(action);

                }
                //Showcase the gaming board after each turn
                for (int row = 0; row < 3; row++) {
                    if (row == 0) {
                        cout << "   0   1   2" << endl << endl;
                    }
                    for (int column = 0; column < 3; column++) {
                        if (column == 0) {
                            cout << row << " ";
                        }

                        if (Board[row][column] == 1) {
                            cout << " X ";
                        }
                        else if (Board[row][column] == -1) {
                            cout << " O ";
                        }
                        else {
                            cout << "   ";
                        }

                        int verticle_line = column + 1;
                        if (verticle_line < 3) {
                            cout << "|";
                        }
                    }
                    cout << endl;

                    int line = row + 1;
                    if (line < 3) {
                        cout << "  -----------";
                    }
                    cout << endl;
                }
                cout << "------------------" << endl;

                //Check if there is a winner in the current game board
                int winner = Winner();
                int end = 0;
                if (winner == 1) {
                    cout << "Agent Won!" << endl;
                    END_GAME = true;        
                }
                else if (winner == -1) {
                    cout << "You Won!" << endl;
                    END_GAME = true;
                }
                else if(winner == 0) {
                    cout << "Tie game!" << endl;
                    END_GAME = true;
                }
                cout << endl;
              

               
                //Change turns
                if (current_player == 1) {
                    current_player = -1;
                }
                else {
                    current_player = 1;
                }
            }

            /*
                Ask the user is he/she would like to have a rematch with the agent after each game has concluded
            */
            string answer;
            cout << "Rematch? (yes or no): ";
            cin >> answer;
            bool unknown = true;
            if (answer == "no") {
                play = false;
                
            }
            else if (answer == "yes") {
                
            }
            else {
                unknown = false;
            }
            while (unknown == false) {
                cout << "Enter yes or no: ";
                cin >> answer;
                if (answer == "no") {
                    play = false;
                    unknown = true;
                }
                else if (answer == "yes") {
                    unknown = true;
                }
            }
           
        }
    }


    void Save_Policy() {
        ofstream myFileX("policy_X.csv");

        for (const auto& pair : player_X) {

            string key = "";

            for (int row = 0; row < 3; row++) {
                for (int col = 0; col < 3; col++) {
                    if (pair.first[row][col] == 1) {
                        key += "X";
                    }
                    else if (pair.first[row][col] == -1) {
                        key += "O";
                    }
                    else {
                        key += "E";
                    }
                }
            }
            myFileX << key << "," << pair.second << "\n";
        }

        myFileX.close();

        
        ofstream myFileO("policy_O.csv");

        for (const auto& pair : player_O) {

            string key = "";

            for (int row = 0; row < 3; row++) {
                for (int col = 0; col < 3; col++) {
                    if (pair.first[row][col] == 1) {
                        key += "X";
                    }
                    else if (pair.first[row][col] == -1) {
                        key += "O";
                    }
                    else {
                        key += "E";
                    }
                }
            }
            myFileO << key << "," << pair.second << "\n";
        }

        myFileO.close();
        
    }

private:

    //GAME BOARD
    array<array<int, 3>, 3> Board = { 0 };

    /*
    Q-Tables: One table for the agent playing as X (1) and one table for the agent playing as O (-1)
    */
    unordered_map<array<array<int, 3>, 3>, float, ArrayHasher> player_X;

    unordered_map<array<array<int, 3>, 3>, float, ArrayHasher> player_O;


    /*
    Vectors that keeps track of the all states each player has made in each episode during training
    */
    vector<array<array<int, 3>, 3>> moves_X;

    vector<array<array<int, 3>, 3>> moves_O;

    //Variable to keep track of the current player's turn
    int current_player;


};



int main()
{
    Game TTT;
    TTT.Train("X");
    TTT.Train("O");
    TTT.Save_Policy();
    //TTT.Face_Agent();

    
    unordered_map<array<array<int, 3>, 3>, float, ArrayHasher> test;

    /*
    array<array<int, 3>, 3> arr =
    {
        1,-1,1,
        1,1,0,
        1,1,-1,
    };


    array<array<int, 3>, 3> arr2 = {
        1,1,1,
        -1,1,-1,
        0,0,1

    };

    array<array<int, 3>, 3> arr3 = {
        -1,-1,-1,
        -1,1,-1,
        0,0,1

    };

    for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 3; col++) {
            cout << arr[row][col] << " ";
        }
        cout << endl;
    }
    cout << endl << endl;


    cout << arr[2][2] << endl;
    cout << arr[1][1] << endl;

    test[arr3] = 10.5;

    test[arr] = 1.5;
    test[arr2] = 3.5;

    cout << test[arr] << endl;

    ofstream myFile("policy.csv");

    //myFile << "test,test2\n";

    //myFile.close();

    cout << "UNORDERED_MAP:\n\n";
    for (const auto& pair : test) {

        string key = "";

        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 3; col++) {
                if (pair.first[row][col] == 1) {
                    key += "X";
                }
                else if (pair.first[row][col] == -1) {
                    key += "O";
                }
                else {
                    key += "E";
                }
            }
            cout << endl;
        }
        myFile << key << "," << pair.second << "\n";
    }

    myFile.close();
    */
    system("pause>0");
}


