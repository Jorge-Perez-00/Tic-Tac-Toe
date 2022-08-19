import { Component } from 'react'
import '../css/Tic-Tac-Toe.css';
import policyX from '../policies/policy_X.csv';
import policyO from '../policies/policy_O.csv';
import Papa from 'papaparse';
import Board from './Board';
import Scoreboard from './ScoreBoard';
import Setup from './Setup';
import Difficulty from './Difficulty';

class TicTacToe extends Component {
    constructor(props) {
        super(props);
        this.state = {
            board: ["E", "E", "E", "E", "E", "E", "E", "E", "E"],
            policy_X: {},
            policy_O: {},
            playerSymbol: '',
            agentSymbol: '',
            start: false,
            message: "",
            reset: false,
            playerScore: 0,
            agentScore: 0,
            difficulty: '?'
        }
    }

    componentDidMount() {

        document.body.style.backgroundColor = "#121212"
        Papa.parse(policyX, {
            header: false,
            download: true,
            complete: (results) => {
                this.parseData(results.data, "policy_X")
            }
        });
        
        Papa.parse(policyO, {
            header: false,
            download: true,
            complete: (results) => {
                this.parseData(results.data, "policy_O")
            }
        });
        
    }

    parseData = (data, policyType) => {
        console.log(policyType);
        let policy = {}
        
        for(let pair = 0; pair < data.length; pair++) {
            policy[data[pair][0]] = data[pair][1];
        }

        policy[data[0][0]] = data[0][1]

        //policyType = "policy_X"
        this.setState({
            [policyType]: policy
        })
    }

    agentsFirstMove(){

        let newBoard = [...this.state.board];

        //Compute random first move for the Agent
        let rNumber = Math.floor(Math.random() * 9);
        newBoard[rNumber] = this.state.agentSymbol;
        //let move = this.state.cells[rNumber];

        this.setState({
            board: newBoard,
            //[move]: mario,
            start: true,
        })


    }
   

    agentsTurn(copyBoard){
        console.log("HELLO I AM THE AGENT!")
      

        let index;
        let max = -9999;
        let epsilon = 0;
        //Choose the correct policy based on the player's current symbol (X or O).
        let policy;
        if(this.state.agentSymbol === 'X') {
            policy = this.state.policy_X;
        }
        else if(this.state.agentSymbol === 'O') {
            policy = this.state.policy_O;
        }

        if(this.state.difficulty === 'Easy') {
            epsilon = 50;
        }
        else if (this.state.difficulty === 'Medium') {
            epsilon = 25;
        }
        else if (this.state.difficulty === 'Impossible') {
            epsilon = 0;
        }

        let board = [...copyBoard];
        let symbol = this.state.agentSymbol;

        let number = Math.floor(Math.random() * 100);


        if(number < epsilon) {
            let openCells = [];
            for(let cell = 0; cell < 9; cell++) {
                if(board[cell] === 'E') {
                    openCells.push(cell);
                }
            }
            let randomIndex = Math.floor(Math.random() * openCells.length)
            index = openCells[randomIndex];
        }
        else {
            for(let cell = 0; cell < 9; cell++) {
                if(board[cell] === 'E'){
                    let tempBoard = [...board];
                    tempBoard[cell] = symbol;

                    tempBoard = tempBoard.join('');
                    if(policy[tempBoard] > max){
                        max = policy[tempBoard];
                        index = cell;

                    
                    }
                }
            }
        }
        board[index] = symbol;
        
        return board;
             
    }

    //FUNCTION THAT CHECKS THE BOARD FOR A WINNER
    checkWinner(copyBoard) {        
        let board = copyBoard;
        console.log(board);

        //CHECK ALL ROWS ON THE BOARD FOR A WINNER
        let row;
        //console.log("ROWS:\n")
        for (let cell = 0; cell < 3; cell++) {
            row = board[cell * 3] + board[cell * 3 + 1] + board[cell*3 + 2];
            //console.log(row)
            if(row === "XXX") {
                return "X";
            }
            else if (row === "OOO") {
                return "O";
            }

        }

        //CHECK ALL COLUMNS ON THE BOARD FOR A WINNER
        let column;
        //console.log("COLUMNS:\n")
        for(let cell = 0; cell < 3; cell++) {
            column = board[cell] + board[cell + 3] + board[cell + 6];
            //console.log(column)
            if(column === "XXX") {
                return "X";
            }
            else if (column === "OOO") {
                return "O";
            }
        }

        let d1 = board[0] + board[4] + board[8];
        let d2 = board[2] + board[4] + board[6];

        //CHECK ALL DIAGONALS ON THE BOARD FOR A WINNER
        if(d1 === "XXX" || d2 === "XXX"){
            return "X";
        }
        else if (d1 === "OOO" || d2 === "OOO") {
            return "O";
        }

        const emptyCells = board.find(element => element === 'E');


        //return "Tie" if there are not more empty cells and there are not winners.
        if(emptyCells === undefined) {
            return "Tie"
        }

        //return "NONE" if the current game has not concluded.
        return "NONE"
    }

    playersTurn = (cell) => {

        //----------------------PLAYER---------------------------

        //GET CURRENT BOARD
        let newBoard = [...this.state.board];

        //GET ARRAY OF CELLS THAT REPRESENTS THE BOARD 
        //let cells = this.state.cells;

        //GET THE CELL THAT WAS CLICKED ON
        //let cell = event.target.id;

        //UPDATE THE ARRAY THAT IS KEEPING TRACK OF ALL MOVES
        //let index = cells.indexOf(cell);
        newBoard[cell] = this.state.playerSymbol;

        //Check for a winner after the player has made a turn.
        let checkOne = this.checkWinner(newBoard);

        console.log("Player:", checkOne);

        //----------------------AGENT---------------------------
      
        //let agentsMove;
        /*
            If the player's move did not conclude the game then agent can now make its next move and then the board will be checked a second time
            for any concluding results (Winner or Draw).
        */
        if(checkOne === "NONE") {
            //Get the Agent's move.
            newBoard = this.agentsTurn(newBoard);

            checkOne = this.checkWinner(newBoard);
            console.log("Agent:", checkOne);
        }


        let winner = checkOne;


        let endGameMessage;
        let pScore = this.state.playerScore;
        let aScore = this.state.agentScore;
        if(winner === this.state.playerSymbol) {
            endGameMessage = "You won!"
            pScore++;
        }
        else if(winner === this.state.agentSymbol) {
            endGameMessage = "You lost!"
            aScore++;
        }
        else if(winner === "Tie") {
            endGameMessage = "Tie game!"
        }

        this.setState({
            board: newBoard,
            start: (winner !== "NONE" ? false : true),
            reset: (winner !== "NONE" && true),
            message: (winner !== "NONE") ? endGameMessage : "",
            playerScore: pScore,
            agentScore: aScore,
        })

        //----------------------UPDATE UI---------------------------
        
        /*
        if (winner === this.state.playerSymbol) {
            let message = ["YOU WON !", "YOU WON ! EZ", "2EZ HUH?", "LMAO HOW DID YOU WIN ?"]
            let rNumber = Math.floor(Math.random() * 4);
            let winMessage = message[rNumber];

            this.setState({
                board: newBoard,
                start: false,
                reset: true,
                message: winMessage,
                playerScore: this.state.playerScore + 1
            })
        }
        else if (winner === this.state.agentSymbol){
            let message = ["YOU LOST !", "BRUH YOU'RE DOODOO", "TRASH LMAO", "YOU SUCK BRUH", "YOU LOST ? SMH", "DOOKIEEEE", ]
            let rNumber = Math.floor(Math.random() * message.length);
            let winMessage = message[rNumber];
            
            this.setState({
                board: newBoard,
                start: false,
                reset: true,
                message: winMessage,
                agentScore: this.state.agentScore + 1
            })
        }
        else if (winner === "Tie" && this.state.playerSymbol === 'X') {
            this.setState({
                board: newBoard,
                start: false,
                reset: true,
                message: "TIE GAME!"
            })
        }
        else if (winner === "Tie" && this.state.playerSymbol === 'O') {
            this.setState({
                board: newBoard,
                start: false,
                reset: true,
                message: "TIE GAME!"
            });
        }
        else{
            this.setState({
                board: newBoard,
            });
        }
        */

    }

    //START GAME BUTTON FUNCTIONALITY
    startGame = (e) => {
        e.persist();
        this.agentsFirstMove();
    }

    //RESET GAME BUTTON FUNCTIONALITY
    resetGame = () => {
        this.setState({
            board: ["E", "E", "E", "E", "E", "E", "E", "E", "E"],
            reset: false,
            start: this.state.playerSymbol === 'X' ? true : false 
        })
    }


    //BOARD CLICKS
    boardClick = (event) => {
        let start = this.state.start;

        let cell = event.target.id.slice(1);
        cell = parseInt(cell, 10);

        console.log(start)
        if(start && this.state.board[cell] === 'E') {
            this.playersTurn(cell);
        }

    }


    chooseSymbol = (event) => {
        event.persist();
        this.setState({
            playerSymbol: event.target.id === 'O' ? 'O' : 'X',
            agentSymbol: event.target.id === 'O' ? 'X' : 'O',
            start: event.target.id === 'X' ? true : false,
        })
        
    }

    changeTurns = () => {
        this.setState({
            playerSymbol: this.state.playerSymbol === 'X' ? 'O' : 'X',
            agentSymbol: this.state.agentSymbol === 'X' ? 'O' : 'X',
            board: ["E", "E", "E", "E", "E", "E", "E", "E", "E"],
            reset: false,
            start: this.state.playerSymbol === 'O' ? true : false 
        })
    }

    setDifficulty = (event) => {
        this.setState({
            difficulty: event.target.id
        })
    }

    changeDifficulty = () => {
        this.setState({
            difficulty: '?',
            board: ["E", "E", "E", "E", "E", "E", "E", "E", "E"],
            reset: false,
            start: this.state.playerSymbol === 'X' ? true : false,
        })
    }
    
    render(){
        
        let message;
        let startButton;
        let isGameInAction = this.state.start;
        let reset = this.state.reset;

        if(!isGameInAction && !reset && this.state.playerSymbol === 'O') {
            message = <h1 className='message'>To begin please press the 'START' button.</h1>
            startButton = <button onClick={this.startGame} className='startButton'>START</button>
        }
       

        return(
            <div className='game'>

                <h1 className='title'>Tic-Tac-Toe</h1>
                <Setup playerSymbol={this.state.playerSymbol} agentSymbol={this.state.agentSymbol} difficulty={this.state.difficulty} chooseSymbol={this.chooseSymbol}/>

                {(this.state.playerSymbol !== '' && this.state.agentSymbol !== '' && this.state.difficulty === '?') &&
                    <Difficulty setDifficulty={this.setDifficulty} />     
                }
                {(this.state.playerSymbol !== '' && this.state.agentSymbol !== '' && this.state.difficulty !== '?') &&
                    <div className='tictactoe'>
                        <Scoreboard pScore={this.state.playerScore} aScore={this.state.agentScore} />
                        
                        <Board boardClick={this.boardClick} board={this.state.board} />
                        {reset && <h1 className={`results ${this.state.message}`}>{this.state.message}</h1>}
                        {message}
                        {startButton}
                        {reset && <button onClick={this.changeTurns} className="end changeSymbolButton">Play as {this.state.agentSymbol}</button>}
                        {reset && <button onClick={this.resetGame} className='end resetButton' >RESET</button>}
                        {reset && <button onClick={this.changeDifficulty} className="end changeDifficultyButton" >Change Difficulty</button> }

                    </div>}


            </div>
        )
    }





}


export default (TicTacToe)
