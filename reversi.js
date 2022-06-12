let screenInfo = {
    width: window.innerWidth <= window.innerHeight
        ? window.innerWidth : window.innerHeight,
    height: window.innerHeight <= window.innerWidth
        ? window.innerHeight : window.innerWidth,
    offsetRate: {
        x: 0.05, y: 0.05
    }
};

let reversiBoardInfo = {
    key: 'reversi_board',
    url: 'assets/reversi_board_505x505.svg',
    width: 505,
    height: 505,
    borderOffsetRate: {
        x: 0.015, y: 0.015
    }
};

let reversiPieceBlankInfo = {
    key: 'reversi_piece_blank',
    url: 'assets/reversi_piece_blank_61x61.svg',
    width: 61,
    height: 61
}

let reversiPieceBlackInfo = {
    key: 'reversi_piece_black',
    url: 'assets/reversi_piece_black_61x61.svg',
    width: 61,
    height: 61
}

let reversiPieceWhiteInfo = {
    key: 'reversi_piece_white',
    url: 'assets/reversi_piece_white_61x61.svg',
    width: 61,
    height: 61
}

let reversiGaming = {
    pieceLineNum: 8,
    images: {
        pieces: new Array(this.pieceLineNum),
        getPieceIndex: function(image) {
            for (let rowIdx in this.pieces) {
                for (let colIdx in this.pieces[rowIdx]) {
                    let images = this.pieces[rowIdx][colIdx];
                    if (images.blank == image) {
                        return {
                            rowIdx: rowIdx, colIdx: colIdx
                        };
                    }
                }
            }
        },
        reflectPiece: function(states) {
            for (let rowIdx in this.pieces) {
                for (let colIdx in this.pieces[rowIdx]) {
                    let state = states.boardMarix[rowIdx][colIdx];
                    let piece = this.pieces[rowIdx][colIdx];
                    switch (state) {
                        case 'e': // Empty
                            piece.black.setVisible(false);
                            piece.white.setVisible(false);
                            break;
                        case 'b': // Black
                            piece.black.setVisible(true);
                            piece.white.setVisible(false);
                            break;
                        case 'w': // White
                            piece.black.setVisible(false);
                            piece.white.setVisible(true);
                            break;
                    }
                }
            }
        }
    },
    states: {
        turnWhite: false,
        boardMarix: new Array(this.pieceLineNum),
        initStates: function () {
            this.turnWhite = false;
            reversiGaming.initBoardMatrix(this.boardMarix, "e");
            this.boardMarix[3][3] = "w";
            this.boardMarix[3][4] = "b";
            this.boardMarix[4][3] = "b";
            this.boardMarix[4][4] = "w";
        },
        selectPiece: function(rowIdx, colIdx) {
            let gaming = reversiGaming;
            let states = gaming.states;

            let reverceList = this.getObtainablePiece(rowIdx, colIdx);
            if (reverceList.length == 0) {
                return;
            }

            this.boardMarix[rowIdx][colIdx] = !this.turnWhite ? 'b' : 'w';

            for (let i in reverceList) {
                let rowIdx = reverceList[i].rowIdx;
                let colIdx = reverceList[i].colIdx;

                if (this.boardMarix[rowIdx][colIdx] == 'b') {
                    this.boardMarix[rowIdx][colIdx] = 'w'
                } else if (this.boardMarix[rowIdx][colIdx] == 'w') {
                    this.boardMarix[rowIdx][colIdx] = 'b'
                }
            }

            gaming.images.reflectPiece(states);
            states.turnWhite = !states.turnWhite
        },
        getObtainablePiece: function(rowIdx, colIdx) {
            let gaming = reversiGaming;

            let directions = [
                {directionRowIdx: -1, directionColIdx: 0}, // Upper Middle
                {directionRowIdx: -1, directionColIdx: 1}, // Upper Right
                {directionRowIdx: 0, directionColIdx: 1}, // Middle Right
                {directionRowIdx: 1, directionColIdx: 1}, // Lower Right
                {directionRowIdx: 1, directionColIdx: 0}, // Lower Middle
                {directionRowIdx: 1, directionColIdx: -1}, // Lower Left
                {directionRowIdx: 0, directionColIdx: -1}, // Middle Left
                {directionRowIdx: -1, directionColIdx: -1} // Upper Left
            ];

            var confirmedReverceList = [];

            if (this.boardMarix[rowIdx][colIdx] != 'e') {
                return confirmedReverceList;
            }

            for (let i in directions) {
                let directionRowIdx = directions[i].directionRowIdx;
                let directionColIdx = directions[i].directionColIdx;

                var first = true;
                var reverceList = [];

                var currentRowIdx = Number(rowIdx);
                var currentColIdx = Number(colIdx);

                while (true) {
                    currentRowIdx = currentRowIdx + directionRowIdx;
                    if (currentRowIdx < 0 || currentRowIdx >= gaming.pieceLineNum) {
                        break;
                    }
    
                    currentColIdx = currentColIdx + directionColIdx;
                    if (currentColIdx < 0 || currentColIdx >= gaming.pieceLineNum) {
                        break;
                    }
    
                    if (first) {
                        // Opponent's stone
                        if (!this.turnWhite && this.boardMarix[currentRowIdx][currentColIdx] != 'w'
                            || this.turnWhite && this.boardMarix[currentRowIdx][currentColIdx] != 'b') {
                            break;
                        } else {
                            reverceList.push({
                                rowIdx: currentRowIdx, colIdx: currentColIdx
                            });
                            first = false
                        }
                    } else {
                        // Own's stone
                        if (!this.turnWhite && this.boardMarix[currentRowIdx][currentColIdx] == 'b'
                            || this.turnWhite && this.boardMarix[currentRowIdx][currentColIdx] == 'w') {
                            confirmedReverceList = confirmedReverceList.concat(reverceList);
                            break;
                        } else if (this.boardMarix[currentRowIdx][currentColIdx] == 'e') {
                            break;
                        } else {
                            reverceList.push({
                                rowIdx: currentRowIdx, colIdx: currentColIdx
                            });
                        }
                    }
                }
            }

            return confirmedReverceList;
        }
    },
    initBoardMatrix: function(matrix, value) {
        for (let rowIdx = 0; rowIdx < this.pieceLineNum; rowIdx++) {
            matrix[rowIdx] = new Array(reversiGaming.pieceLineNum);
            for (let colIdx = 0; colIdx < this.pieceLineNum; colIdx++) {
                matrix[rowIdx][colIdx] = value;
            }
        }
    }
};

function setScreenRateFuncs(info) {
    info['getOffset'] = function (screenInfo) {
        return {
            x: screenInfo.width * screenInfo.offsetRate.x,
            y: screenInfo.width * screenInfo.offsetRate.y,
        }
    };

    info['seekScreenFitZoomRate'] = function (screenInfo) {
        let offset = this.getOffset(screenInfo);
        let offsetY = offset.y
        this['zoomRate'] = (screenInfo.width - offsetY * 2) / this.width;
    };

    info['getZoomSize'] = function () {
        return {
            width: this.width * this.zoomRate,
            height: this.height * this.zoomRate
        };
    };

    info['getCenter'] = function () {
        return {
            x: this.getZoomSize().width / 2,
            y: this.getZoomSize().height / 2
        }
    };

    info['getCenterOffset'] = function (screenInfo, zoomSize) {
        return {
            x: (screenInfo.width - zoomSize.width) * 0.5,
            y: (screenInfo.height - zoomSize.height) * 0.5,
        }
    };
};
setScreenRateFuncs(reversiBoardInfo);
setScreenRateFuncs(reversiPieceBlankInfo);
setScreenRateFuncs(reversiPieceBlackInfo);
setScreenRateFuncs(reversiPieceWhiteInfo);

function setBoardPieceRateFuncs(info) {
    info['getBorderOffset'] = function() {
        return {
            x: screenInfo.width * reversiBoardInfo.borderOffsetRate.x,
            y: screenInfo.height * reversiBoardInfo.borderOffsetRate.y,
        }
    }

    info['seekScreenFitZoomRate'] = function (screenInfo) {
        let offsetX = this.getOffset(screenInfo).x
            + this.getBorderOffset().x;
        this['zoomRate'] = (screenInfo.width - offsetX * 2
            ) / reversiGaming.pieceLineNum / this.width;
    };

    info['getBoardIndexOffset'] = function (screenInfo, colIdx, rowIdx) {
        let zoomSize = this.getZoomSize();
        let borderOffset = this.getBorderOffset();
        return {
            x: screenInfo.width * screenInfo.offsetRate.x
                + zoomSize.width * colIdx
                + borderOffset.x,
            y: screenInfo.height * screenInfo.offsetRate.y
                + zoomSize.height * rowIdx
                + borderOffset.y,
        }
    };
}
setBoardPieceRateFuncs(reversiPieceBlankInfo);
setBoardPieceRateFuncs(reversiPieceBlackInfo);
setBoardPieceRateFuncs(reversiPieceWhiteInfo);

let game = new Phaser.Game({
    type: Phaser.WEBGL,
    width: screenInfo.width,
    height: screenInfo.height,
    backgroundColor: '#FAF9F6',
    scene: {
        preload: function() {
            [reversiBoardInfo, reversiPieceBlankInfo, reversiPieceBlackInfo,
                reversiPieceWhiteInfo]
            .forEach(info => {
                info.seekScreenFitZoomRate(screenInfo);
                let size = info.getZoomSize();
                console.log(size);
                this.load.svg(info.key, info.url, {
                    width: size.width,
                    height: size.height
                });
            })
        },
        create: function() {
            let gaming = reversiGaming;
            let states = gaming.states;
            states.initStates();

            {
                let info = reversiBoardInfo;
                let center = info.getCenter();
                let offset = info.getOffset(screenInfo);
                this.add.image(
                    center.x + offset.x,
                    center.y + offset.y,
                    info.key);
            }

            let images = gaming.images;
            let pieces = images.pieces;
            gaming.initBoardMatrix(pieces, null);
            for (let rowIdx in pieces) {
                for (let colIdx in pieces[rowIdx]) {
                    let images = {
                        blank: [],
                        black: [],
                        white: []
                    };

                    [{info: reversiPieceBlankInfo, piece: images.blank, visible: true, interactive: true},
                        {info: reversiPieceBlackInfo, piece: images.black, visible: false, interactive: false},
                        {info: reversiPieceWhiteInfo, piece: images.white, visible: false, interactive: false}]
                        .forEach(t => {
                            let info = t.info;
                            let center = info.getCenter();
                            let offset = info.getBoardIndexOffset(screenInfo, colIdx, rowIdx);
    
                            t.piece.push(this.add.image(
                                center.x + offset.x,
                                center.y + offset.y,
                                info.key));
                            if (t.interactive) {
                                t.piece[0].setInteractive()
                            }
                            t.piece[0].setVisible(t.visible);
                        });

                    pieces[rowIdx][colIdx] = Object.keys(images).reduce((current, key) => {
                        current[key] = images[key][0];
                        return current;
                    }, {});
                }
            }

            images.reflectPiece(states);
        
            // this.input.on('gameobjectdown', (pointer, gameobject) => {
            //     //console.log('d');
            // });
        
            this.input.on('gameobjectup', (pointer, gameobject) => {
                let gaming = reversiGaming;
                let states = gaming.states;
                let index = gaming.images.getPieceIndex(gameobject);
                console.log(index);
                states.selectPiece(index.rowIdx, index.colIdx);
                console.log(states.boardMarix);
                //console.log('u');
            });
        },
        update: function() {
            //console.log('update')
        }
    }
});
