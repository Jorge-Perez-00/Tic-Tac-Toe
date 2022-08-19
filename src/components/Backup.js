import { Component } from 'react'
import '../css/GameBoard.css';
import mario from '../images/mario.png';
import luigi from '../images/luigi.png';
import policyX from '../policies/policy_X.csv';
import policyO from '../policies/policy_O.csv';
import Papa from 'papaparse';
import Board from './Board';
import Scoreboard from './ScoreBoard';

class TicTacToe extends Component {
    constructor(props) {
        super(props);
        this.state = {
            board: ["E", "E", "E", "E", "E", "E", "E", "E", "E"],
            zero: '',
            one: '',
            two: '',
            three: '',
            four: '',
            five: '',
            six: '',
            seven: '',
            eight: '',
            policy_X: {},
            policy_O: {},
            playerSymbol: '',
            agentSymbol: '',
            playerImg: '',
            agentImg: '',
            cells: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"],
            start: false,
            message: "",
            reset: false,
            playerScore: 0,
            agentScore: 0,
            difficulty: ''
        }
        this.board = ["E", "E", "E", "E", "E", "E", "E", "E", "E"];
        this.cells = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
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

        for (let pair = 0; pair < data.length; pair++) {
            policy[data[pair][0]] = data[pair][1];
        }

        policy[data[0][0]] = data[0][1]

        //policyType = "policy_X"
        this.setState({
            [policyType]: policy
        })
    }

    agentsFirstMove() {

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


    agentsTurn() {
        console.log("HELLO I AM THE AGENT!")


        let index;
        let max = -9999;
        let epsilon = 0;
        //Choose the correct policy based on the player's current symbol (X or O).
        let policy;
        if (this.state.agentSymbol === 'X') {
            policy = this.state.policy_X;
        }
        else if (this.state.agentSymbol === 'O') {
            policy = this.state.policy_O;
        }

        if (this.state.difficulty === 'Easy') {
            epsilon = 50;
        }
        else if (this.state.difficulty === 'Medium') {
            epsilon = 25;
        }
        else if (this.state.difficulty === 'Impossible') {
            epsilon = 0;
        }

        let board = this.state.board;
        let symbol = this.state.agentSymbol;

        let number = Math.floor(Math.random() * 100);


        if (number < epsilon) {
            let openCells = [];
            for (let cell = 0; cell < 9; cell++) {
                if (board[cell] === 'E') {
                    openCells.push(cell);
                }
            }
            let randomIndex = Math.floor(Math.random() * openCells.length)
            index = openCells[randomIndex];
        }
        else {
            for (let cell = 0; cell < 9; cell++) {
                if (board[cell] === 'E') {
                    let tempBoard = [...board];
                    tempBoard[cell] = symbol;

                    tempBoard = tempBoard.join('');
                    if (policy[tempBoard] > max) {
                        max = policy[tempBoard];
                        index = cell;


                    }
                }
            }
        }
        board[index] = symbol;
        let move = this.state.cells[index];

        return move;

    }

    //FUNCTION THAT CHECKS THE BOARD FOR A WINNER
    checkWinner() {
        let board = [...this.state.board];

        //CHECK ALL ROWS ON THE BOARD FOR A WINNER
        let row;
        //console.log("ROWS:\n")
        for (let cell = 0; cell < 3; cell++) {
            row = board[cell * 3] + board[cell * 3 + 1] + board[cell * 3 + 2];
            //console.log(row)
            if (row === "XXX") {
                return "X";
            }
            else if (row === "OOO") {
                return "O";
            }

        }

        //CHECK ALL COLUMNS ON THE BOARD FOR A WINNER
        let column;
        //console.log("COLUMNS:\n")
        for (let cell = 0; cell < 3; cell++) {
            column = board[cell] + board[cell + 3] + board[cell + 6];
            //console.log(column)
            if (column === "XXX") {
                return "X";
            }
            else if (column === "OOO") {
                return "O";
            }
        }

        let d1 = board[0] + board[4] + board[8];
        let d2 = board[2] + board[4] + board[6];

        //CHECK ALL DIAGONALS ON THE BOARD FOR A WINNER
        if (d1 === "XXX" || d2 === "XXX") {
            return "X";
        }
        else if (d1 === "OOO" || d2 === "OOO") {
            return "O";
        }

        const emptyCells = board.find(element => element === 'E');


        //return "Tie" if there are not more empty cells and there are not winners.
        if (emptyCells === undefined) {
            return "Tie"
        }

        //return "NONE" if the current game has not concluded.
        return "NONE"
    }

    playersTurn = (event) => {

        //----------------------PLAYER---------------------------

        //GET CURRENT BOARD
        let board = this.state.board;

        //GET ARRAY OF CELLS THAT REPRESENTS THE BOARD 
        let cells = this.state.cells;

        //GET THE CELL THAT WAS CLICKED ON
        let cell = event.target.id;

        //UPDATE THE ARRAY THAT IS KEEPING TRACK OF ALL MOVES
        let index = cells.indexOf(cell);
        board[index] = this.state.playerSymbol;

        //Check for a winner after the player has made a turn.
        let checkOne = this.checkWinner();

        console.log("Player:", checkOne);

        //----------------------AGENT---------------------------

        let agentsMove;
        /*
            If the player's move did not conclude the game then agent can now make its next move and then the board will be checked a second time
            for any concluding results (Winner or Draw).
        */
        if (checkOne === "NONE") {
            //Get the Agent's move.
            agentsMove = this.agentsTurn();

            checkOne = this.checkWinner();
            console.log("Agent:", checkOne);
        }


        let winner = checkOne;

        //----------------------UPDATE UI---------------------------

        if (winner === this.state.playerSymbol) {
            let message = ["YOU WON !", "YOU WON ! EZ", "2EZ HUH?", "LMAO HOW DID YOU WIN ?"]
            let rNumber = Math.floor(Math.random() * 4);
            let winMessage = message[rNumber];

            this.setState({
                [event.target.id]: this.state.playerImg,
                start: false,
                reset: true,
                message: winMessage,
                playerScore: this.state.playerScore + 1
            })
        }
        else if (winner === this.state.agentSymbol) {
            let message = ["YOU LOST !", "BRUH YOU'RE DOODOO", "TRASH LMAO", "YOU SUCK BRUH", "YOU LOST ? SMH", "DOOKIEEEE",]
            let rNumber = Math.floor(Math.random() * message.length);
            let winMessage = message[rNumber];

            this.setState({
                [event.target.id]: this.state.playerImg,
                [agentsMove]: this.state.agentImg,
                start: false,
                reset: true,
                message: winMessage,
                agentScore: this.state.agentScore + 1
            })
        }
        else if (winner === "Tie" && this.state.playerSymbol === 'X') {
            this.setState({
                [event.target.id]: this.state.playerImg,
                start: false,
                reset: true,
                message: "TIE GAME!"
            })
        }
        else if (winner === "Tie" && this.state.playerSymbol === 'O') {
            this.setState({
                [event.target.id]: this.state.playerImg,
                [agentsMove]: this.state.agentImg,
                start: false,
                reset: true,
                message: "TIE GAME!"
            });
        }
        else {
            this.setState({
                [event.target.id]: this.state.playerImg,
                [agentsMove]: this.state.agentImg,
            });
        }


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
            zero: '',
            one: '',
            two: '',
            three: '',
            four: '',
            five: '',
            six: '',
            seven: '',
            eight: '',
            reset: false,
            start: this.state.playerSymbol === 'X' ? true : false
        })
    }


    //BOARD CLICKS
    boardClick = (event) => {
        let start = this.state.start;

        let cell = event.target.id;
        let index = this.state.cells.indexOf(cell);
        console.log(this.state.board[index])
        if (start && this.state.board[index] === 'E') {
            this.playersTurn(event);
        }

    }

    chooseSymbol = (event) => {
        event.persist();
        if (event.target.id === 'O') {
            this.setState({
                playerSymbol: 'O',
                agentSymbol: 'X',
                playerImg: luigi,
                agentImg: mario,
                message: "To begin please press the 'START' button."
            })
        }
        else {
            this.setState({
                start: true,
                playerSymbol: 'X',
                agentSymbol: 'O',
                playerImg: mario,
                agentImg: luigi
            })
        }
    }

    changeTurns = () => {
        this.setState({
            playerSymbol: this.state.playerSymbol === 'X' ? 'O' : 'X',
            agentSymbol: this.state.agentSymbol === 'X' ? 'O' : 'X',
            playerImg: this.state.playerImg === luigi ? mario : luigi,
            agentImg: this.state.agentImg === luigi ? mario : luigi,
            board: ["E", "E", "E", "E", "E", "E", "E", "E", "E"],
            zero: '',
            one: '',
            two: '',
            three: '',
            four: '',
            five: '',
            six: '',
            seven: '',
            eight: '',
            reset: false,
            start: this.state.playerSymbol === 'O' ? true : false
        })
    }

    setDifficulty = (event) => {
        this.setState({
            difficulty: event.target.id
        })
    }

    render() {
        let image0 = (this.state.zero !== "") ? <img src={this.state.zero} alt="" /> : "";
        let image1 = (this.state.one !== "") ? <img src={this.state.one} alt="" /> : "";
        let image2 = (this.state.two !== "") ? <img src={this.state.two} alt="" /> : "";
        let image3 = (this.state.three !== "") ? <img src={this.state.three} alt="" /> : "";
        let image4 = (this.state.four !== "") ? <img src={this.state.four} alt="" /> : "";
        let image5 = (this.state.five !== "") ? <img src={this.state.five} alt="" /> : "";
        let image6 = (this.state.six !== "") ? <img src={this.state.six} alt="" /> : "";
        let image7 = (this.state.seven !== "") ? <img src={this.state.seven} alt="" /> : "";
        let image8 = (this.state.eight !== "") ? <img src={this.state.eight} alt="" /> : "";

        let message;
        let startButton;
        let resetButton;
        let isGameInAction = this.state.start;
        let reset = this.state.reset;

        if (!isGameInAction && !reset && this.state.playerSymbol === 'O') {
            startButton = <button onClick={this.startGame} className='startButton'>START</button>
        }

        if (!isGameInAction) {
            message = <h1>{this.state.message}</h1>
        }

        if (reset) {
            resetButton = <button onClick={this.resetGame} className='resetButton' >RESET</button>
        }



        let board = [...this.state.board];

        return (
            <div className='game'>

                <h1 className='title'>Tic-Tac-Toe</h1>
                {(this.state.playerSymbol === '' && this.state.agentSymbol === '') ?
                    <div className='choosingSymbol'>
                        <button onClick={this.chooseSymbol} id={'O'} className='playO'>Play as <span>O</span></button>
                        <button onClick={this.chooseSymbol} id={'X'} className='playX'>Play as <span>X</span></button>
                    </div> :
                    <h2 className='info'> You are playing as <span className='symbol' >{this.state.playerSymbol}</span> | Difficulty:<span className={this.state.difficulty} >{this.state.difficulty}</span> </h2>
                }

                {(this.state.playerSymbol !== '' && this.state.agentSymbol !== '' && this.state.difficulty === '') ?
                    <div className='modeSpace'>
                        <button onClick={this.setDifficulty} id='Easy' className='easyButton'>Easy</button>
                        <button onClick={this.setDifficulty} id='Medium' className='mediumButton'>Medium</button>
                        <button onClick={this.setDifficulty} id='Impossible' className='impossibleButton'>Impossible</button>
                    </div> : null

                }

                {(this.state.playerSymbol !== '' && this.state.agentSymbol !== '' && this.state.difficulty !== '') ?
                    <div className='tictactoe'>
                        <Scoreboard pScore={this.state.playerScore} aScore={this.state.agentScore} />
                        <table className='board'>
                            <tbody>
                                <tr>
                                    <td onClick={this.boardClick} id={"zero"} className={board[0] !== 'E' ? board[0] : ""}>{image0}</td>
                                    <td onClick={this.boardClick} id={"one"} className={board[1] !== 'E' ? board[1] : ""}>{image1}</td>
                                    <td onClick={this.boardClick} id={"two"} className={board[2] !== 'E' ? board[2] : ""}>{image2}</td>
                                </tr>
                                <tr>
                                    <td onClick={this.boardClick} id={"three"} className={board[3] !== 'E' ? board[3] : ""}>{image3}</td>
                                    <td onClick={this.boardClick} id={"four"} className={board[4] !== 'E' ? board[4] : ""}>{image4}</td>
                                    <td onClick={this.boardClick} id={"five"} className={board[5] !== 'E' ? board[5] : ""}>{image5}</td>
                                </tr>
                                <tr>
                                    <td onClick={this.boardClick} id={"six"} className={board[6] !== 'E' ? board[6] : ""}>{image6}</td>
                                    <td onClick={this.boardClick} id={"seven"} className={board[7] !== 'E' ? board[7] : ""}>{image7}</td>
                                    <td onClick={this.boardClick} id={"eight"} className={board[8] !== 'E' ? board[8] : ""}>{image8}</td>
                                </tr>
                            </tbody>
                        </table>
                        {message}
                        {startButton}
                        {resetButton}
                        {(reset === true) ? <button onClick={this.changeTurns} className="changeSymbolButton">Play as {this.state.agentSymbol}</button> : null}
                        <Board boardClick={this.boardClick} board={this.state.board} />

                    </div> : null}


            </div>
        )
    }





}


export default (TicTacToe)
