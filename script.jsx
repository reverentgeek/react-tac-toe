var StartNewGame = React.createClass( {
	render: function() {
		return (
			<div>
				<button className="btn btn-primary" onClick={ this.props.onPlayersSelect.bind( null, 1 ) }>Start 1-Player</button>
				&nbsp;
				<button className="btn btn-primary" onClick={ this.props.onPlayersSelect.bind( null, 2 ) }>Start 2-Player</button>
			</div>
			);
	}
} );

var GameStatus = React.createClass( {
	statics: {
		winnerStatuses: {
			x: "X wins!",
			o: "O wins!",
			t: "Tie!"
		}
	},
	render: function() {
		var status = GameStatus.winnerStatuses[ this.props.winner ] || "Current turn: " + this.props.currentTurn;
		return <div className="well"><h2>{ status }</h2></div>;
	}
} );

var GameGrid = React.createClass( {
	render: function() {
		var makeMove = this.props.makeMove;
		var b = this.props.selectedMoves.map( function( s, i ) {
			if ( s ) {
				return <div className="turn-button disabled">{ s.toUpperCase() }</div>;
			} else if ( makeMove ) {
				return <div className="turn-button" onClick={ makeMove.bind( null, i ) }>&nbsp;</div>;
			}
		} );
		return ( <table id="game-table" className="table table-bordered">
			<tr><td>{ b[0] }</td><td>{ b[1] }</td><td>{ b[2] }</td></tr>
			<tr><td>{ b[3] }</td><td>{ b[4] }</td><td>{ b[5] }</td></tr>
			<tr><td>{ b[6] }</td><td>{ b[7] }</td><td>{ b[8] }</td></tr>
		</table> );
	}
} );

var gameHelpers = {
	copyMoves: function( selectedMoves ) {
		var moves = [];
		for ( var i = 0; i < selectedMoves.length; i++ ) {
			moves.push( selectedMoves[i] );
		}
		return moves;
	},
	isWinningSet: function( selectedMoves ) {
		var b = selectedMoves;
		if ( b[0] !== "" && b[0] === b[1] && b[1] === b[2] ) {
			return b[0];
		}
		if ( b[1] !== "" && b[1] === b[4] && b[1] === b[7] ) {
			return b[1];
		}
		if ( b[2] !== "" && b[2] === b[5] && b[2] === b[8] ) {
			return b[2];
		}
		if ( b[0] !== "" && b[0] === b[4] && b[0] === b[8] ) {
			return b[0];
		}
		if ( b[2] !== "" && b[2] === b[4] && b[2] === b[6] ) {
			return b[2];
		}
		if ( b[0] !== "" && b[0] === b[3] && b[0] === b[6] ) {
			return b[0];
		}
		if ( b[3] !== "" && b[3] === b[4] && b[3] === b[5] ) {
			return b[3];
		}
		if ( b[6] !== "" && b[6] === b[7] && b[6] === b[8] ) {
			return b[6];
		}
		if ( b.indexOf( "" ) === -1 ) {
			return "t";
		}
		return null;
	},
	isWinnable: function( selectedMoves, nextTurn, requiredTurn ) {
		var moves = this.availableMoves( selectedMoves );
		if ( moves.length === 0 ) {
			return "";
		}
		for ( var i = 0; i < moves.length; i++ ) {
			var testMoves = this.copyMoves( selectedMoves );
			testMoves[moves[i]] = nextTurn;
			var win = this.isWinningSet( testMoves );
			if ( win && win !== "t" ) {
				if ( requiredTurn ) {
					if ( win === requiredTurn ) {
						return true;
					}
				} else {
					return true;
				}
			} else {
				win = this.isWinnable( testMoves, nextTurn === "x" ? "o" : "x", requiredTurn );
				if ( win ) {
					return true;
				}
			}
		}
		return false;
	},
	availableWinningMoves: function( selectedMoves, currentTurn ) {
		var moves = this.availableMoves( selectedMoves );
		var winningMoves = [];
		if ( moves.length === 0 ) {
			return winningMoves;
		}
		for ( var i = 0; i < moves.length; i++ ) {
			var testMoves = this.copyMoves( selectedMoves );
			testMoves[moves[i]] = currentTurn;
			var win = this.isWinningSet( testMoves );
			if ( win === currentTurn ) {
				winningMoves.push( moves[i] );
			} else {
				if ( this.isWinnable( testMoves, currentTurn === "x" ? "o" : "x", currentTurn ) ) {
					winningMoves.push( moves[i] );
				}
			}
		}
		return winningMoves;
	},
	availableMoves: function( selectedMoves ) {
		var moves = [];
		for ( var i = 0; i < selectedMoves.length; i++ ) {
			if ( selectedMoves[i] === "" ) {
				moves.push( i );
			}
		}
		return moves;
	},
	nextPossibleMove: function( selectedMoves, currentTurn ) {
		var b = selectedMoves;
		var p = currentTurn;
		var opponent = ( p === "o" ) ? "x" : "o";
		var availableMoves = this.availableMoves( selectedMoves );

		if ( availableMoves.length === 0 ) {
			return null;
		}

		// is there a play where p can win?
		for ( var i = 0; i < availableMoves.length; i++ ) {
			var index = availableMoves[i];
			b[index] = p;
			if ( p === this.isWinningSet( b ) ) {
				return index;
			} else {
				b[index] = "";
			}
		}

		// is opponent about to make a winning move?
		for ( var i = 0; i < availableMoves.length; i++ ) {
			var index = availableMoves[i];
			b[index] = opponent;
			if ( opponent === this.isWinningSet( b ) ) {
				return index;
			} else {
				b[index] = "";
			}
		}

		// Take center, if available
		if ( b[4] === "" ) {
			return 4;
		}

		// is there a winning move available?
		var wins = this.availableWinningMoves( selectedMoves, currentTurn );
		if ( wins && wins.length > 0 ) {
			return wins[0];
		}

		// take next available move
		return availableMoves[0];
	}
};

var Main = React.createClass( {
	getInitialState: function() {
		var b = [ "", "", "", "", "", "", "", "", "" ];
		return { winner: null, selectedMoves: b, currentTurn: "x", started: false };
	},
	resetGame: function( numOfPlayers ) {
		var newState = this.getInitialState();
		newState.numOfPlayers = numOfPlayers;
		newState.started = true;
		this.setState( newState );
	},
	makeMove: function( index ) {
		var sb = this.state.selectedMoves;
		var turn = this.state.currentTurn;
		var nextTurn = turn === "x" ? "o" : "x";
		sb[index] = turn;

		var win = gameHelpers.isWinningSet( sb );
		if ( !!win === false && !gameHelpers.isWinnable( sb, nextTurn ) ) {
			win = "t";
		}
		var newState = {
			selectedMoves: sb,
			currentTurn: nextTurn,
			winner: win
		};

		this.setState( newState, function() {
			if ( !this.state.winner && this.state.numOfPlayers === 1 && this.state.currentTurn === "o" ) {
				this.makeComputerMove();
			}
		} );
	},
	makeComputerMove: function() {
		var nextMove = gameHelpers.nextPossibleMove( this.state.selectedMoves, this.state.currentTurn );
		this.makeMove( nextMove );
	},
	renderGame: function( gameOver ) {
		return (
			<div>
				<GameGrid selectedMoves={ this.state.selectedMoves } makeMove={ gameOver ? null : this.makeMove } />
				<GameStatus winner={ this.state.winner } currentTurn={ this.state.currentTurn } />
			</div>
			);
	},
	render: function() {
		var gameStarted = this.state.started;
		var gameOver = !!this.state.winner;

		var gameControls = <StartNewGame onPlayersSelect={ this.resetGame } />;
		var showGameControls = !gameStarted || gameOver;

		return (
			<div>
				<h1>React-Tac-Toe</h1>
				{ gameStarted ? this.renderGame( gameOver ) : null }
				{ showGameControls ? gameControls : null }
			</div>
			);
	}
} );

React.render(
	<Main />,
	document.getElementById( "container" )
);
