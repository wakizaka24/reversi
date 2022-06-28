let screenInfo = {
    width: window.innerWidth <= window.innerHeight
        ? window.innerWidth : window.innerHeight,
    height: window.innerHeight <= window.innerWidth
        ? window.innerHeight : window.innerWidth,
    offsetRate: {
        x: 0.05, y: 0.05
    },
    initSize: function() {
        this.width = window.innerWidth <= window.innerHeight
            ? window.innerWidth : window.innerHeight;
        this.height = window.innerHeight <= window.innerWidth
            ? window.innerHeight : window.innerWidth;
    },
    getOffset: function () {
        return {
            x: this.width * this.offsetRate.x,
            y: this.width * this.offsetRate.y,
        }
    }
};

let reversiBoardInfo = {
    key: 'reversi_board',
    url: 'assets/reversi_board_505x505.svg',
    width: 505,
    height: 505,
    borderOffsetRate: {
        x: 0.015, y: 0.015
    },
    centerTextFontRate: 0.08,
    getCenterTextFontSize: function (screenInfo) {
        return screenInfo.width * this.centerTextFontRate;
    },
    getBorderOffset: function(screenInfo) {
        return {
            x: screenInfo.width * this.borderOffsetRate.x,
            y: screenInfo.height * this.borderOffsetRate.y,
        }
    }
};

let reversiPieceBlankInfo = {
    key: 'reversi_piece_blank',
    url: 'assets/reversi_piece_blank_61x61.svg',
    width: 61,
    height: 61
}

let reversiPieceBlackInfo = {
    keyBase: 'reversi_piece_black',
    urls: ['assets/reversi_piece_black_01_61x61.svg',
        'assets/reversi_piece_black_02_61x61.svg',
        'assets/reversi_piece_black_03_61x61.svg',
        'assets/reversi_piece_black_04_61x61.svg',
        'assets/reversi_piece_black_05_61x61.svg',
        'assets/reversi_piece_black_06_61x61.svg',
        'assets/reversi_piece_black_07_61x61.svg',
        'assets/reversi_piece_black_08_61x61.svg',
        'assets/reversi_piece_black_09_61x61.svg',
        'assets/reversi_piece_black_10_61x61.svg',
        'assets/reversi_piece_black_11_61x61.svg',
        'assets/reversi_piece_black_12_61x61.svg',
        'assets/reversi_piece_black_13_61x61.svg'],
    width: 61,
    height: 61
}

let reversiPieceWhiteInfo = {
    keyBase: 'reversi_piece_white',
    urls: ['assets/reversi_piece_white_01_61x61.svg',
        'assets/reversi_piece_white_02_61x61.svg',
        'assets/reversi_piece_white_03_61x61.svg',
        'assets/reversi_piece_white_04_61x61.svg',
        'assets/reversi_piece_white_05_61x61.svg',
        'assets/reversi_piece_white_06_61x61.svg',
        'assets/reversi_piece_white_07_61x61.svg',
        'assets/reversi_piece_white_08_61x61.svg',
        'assets/reversi_piece_white_09_61x61.svg',
        'assets/reversi_piece_white_10_61x61.svg',
        'assets/reversi_piece_white_11_61x61.svg',
        'assets/reversi_piece_white_12_61x61.svg',
        'assets/reversi_piece_white_13_61x61.svg'],
    width: 61,
    height: 61
}

function setMultiKeyFuncs(info) {
    info['getKey'] = function (i) {
        return this.keyBase + "_" + String(i).padStart(2, '0');
    };
    info['getFirstKey'] = function() {
        if (this.urls) {
            return this.getKey(0);
        } else {
            return this.key;
        }
    }
};
setMultiKeyFuncs(reversiPieceBlankInfo);
setMultiKeyFuncs(reversiPieceBlackInfo);
setMultiKeyFuncs(reversiPieceWhiteInfo);

let reversiGaming = {
    pieceLineNum: 8,
    testMode: false,
    objects: {
        game: null,
        pieces: new Array(this.pieceLineNum),
        centerText: null,
        getPieceIndex: function(image) {
            for (let rowIdx = 0; rowIdx < this.pieces.length; rowIdx++) {
                for (let colIdx = 0; colIdx < this.pieces[rowIdx].length; colIdx++) {
                    let images = this.pieces[rowIdx][colIdx];
                    if (images.blank[0] == image) {
                        return {
                            rowIdx: rowIdx, colIdx: colIdx
                        };
                    }
                }
            }
        },
        reflectPieces: function(states) {
            for (let rowIdx = 0; rowIdx < this.pieces.length; rowIdx++) {
                for (let colIdx = 0; colIdx < this.pieces[rowIdx].length; colIdx++) {
                    this.reflectPiece(states, rowIdx, colIdx);
                }
            }
        },
        reflectPiece: function(states, rowIdx, colIdx) {
            let state = states.boardMarix[rowIdx][colIdx];
            let piece = this.pieces[rowIdx][colIdx];
            switch (state) {
                case 'e': // Empty
                    piece.black[0].setVisible(false);
                    piece.white[0].setVisible(false);
                    break;
                case 'b': // Black
                    piece.black[0].setVisible(true);
                    piece.white[0].setVisible(false);
                    break;
                case 'w': // White
                    piece.black[0].setVisible(false);
                    piece.white[0].setVisible(true);
                    break;
            }
        },
        changePieces: function(states, changeList, i, completion) {
            if (i < changeList.length) {
                let change = changeList[i];
                let rowIdx = change.rowIdx;
                let colIdx = change.colIdx;
                let piece = change.piece;

                let self = this;
                function _completion() {
                    self.game.time.delayedCall(0, self.changePieces,
                        [states, changeList, ++i, completion], self);
                }

                if (change.skip) {
                    states.boardMarix[rowIdx][colIdx] = piece;
                    this.reflectPiece(states, rowIdx, colIdx);
                    _completion();
                } else {
                    if (piece == 'w') {
                        this.changePieceAnimation(states, 'black', 'white', 'w',
                        rowIdx, colIdx, 1, _completion);
                    } else if (piece == 'b') {
                        this.changePieceAnimation(states, 'white', 'black', 'b',
                        rowIdx, colIdx, 1, _completion);
                    }
                }
            } else {
                completion(states);
            }
        },
        changePieceAnimation: function(states, from, to, piece, rowIdx, colIdx, i, completion) {
            /*
            let frameList = [
                {type: from, f:0}, {type: from, f:1}, {type: from, f:2}, {type: from, f:3},
                {type: from, f:4}, {type: from, f:5}, {type: from, f:6}, {type: from, f:7},
                {type: from, f:8}, {type: from, f:9}, {type: from, f:10}, {type: from, f:11},
                {type: from, f:12},
                {type: to, f:12}, {type: to, f:11}, {type: to, f:10}, {type: to, f:9},
                {type: to, f:8}, {type: to, f:7}, {type: to, f:6}, {type: to, f:5},
                {type: to, f:4}, {type: to, f:3}, {type: to, f:2}, {type: to, f:1},
                {type: to, f:0}
            ];
            */

            let frameList = [
                {type: from, f:0}, {type: from, f:3}, {type: from, f:6}, {type: from, f:9},
                {type: from, f:12},
                {type: to, f:12},  {type: to, f:9}, {type: to, f:6}, {type: to, f:3},
                {type: to, f:0}
            ];

            if (i < frameList.length) {
                states.boardMarix[rowIdx][colIdx] = piece;

                let prevFrame = frameList[i - 1];
                this.pieces[rowIdx][colIdx][prevFrame.type][prevFrame.f].setVisible(false);
                let frame = frameList[i];
                this.pieces[rowIdx][colIdx][frame.type][frame.f].setVisible(true);

                this.game.time.delayedCall(0, this.changePieceAnimation,
                    [states, from, to, piece, rowIdx, colIdx, ++i, completion], this);
            } else {
                completion();
            }
        }
    },
    states: {
        boardMarix: new Array(this.pieceLineNum),
        pieceCounts: {
            black: null,
            white: null,
            getSum: function() {
                return this.black + this.white
            }
        },
        turnWhite: false,
        skipping: false,
        end: false,
        initStates: function () {
            let gaming = reversiGaming;
            gaming.initBoardMatrix(this.boardMarix, "e");
            let topLeftIdx = (gaming.pieceLineNum / 2)  - 1;
            let bottomRightIdx = (gaming.pieceLineNum / 2);
            this.boardMarix[topLeftIdx][topLeftIdx] = "w";
            this.boardMarix[topLeftIdx][bottomRightIdx] = "b";
            this.boardMarix[bottomRightIdx][topLeftIdx] = "b";
            this.boardMarix[bottomRightIdx][bottomRightIdx] = "w";
            this.pieceCounts.black = 2;
            this.pieceCounts.white = 2;
            this.turnWhite = false;
            this.skipping = false;
            this.end = false;
        },
        selectPiece: function(rowIdx, colIdx, reverceList, completion) {
            let gaming = reversiGaming;
            let states = gaming.states;

            if (reverceList == null) {
                reverceList = this.getObtainablePiece(rowIdx, colIdx);
                if (reverceList.length == 0) {
                    completion(false);
                    return;
                }
            }

            var changeList = [];
            if (!this.turnWhite) {
                changeList.push({rowIdx: rowIdx, colIdx: colIdx, piece: 'b', skip: true});
                this.pieceCounts.black++;
            } else {
                changeList.push({rowIdx: rowIdx, colIdx: colIdx, piece: 'w', skip: true});
                this.pieceCounts.white++;
            }

            for (let i in reverceList) {
                let rowIdx = reverceList[i].rowIdx;
                let colIdx = reverceList[i].colIdx;

                if (this.boardMarix[rowIdx][colIdx] == 'b') {
                    changeList.push({rowIdx: rowIdx, colIdx: colIdx, piece: 'w', skip: false});
                } else if (this.boardMarix[rowIdx][colIdx] == 'w') {
                    changeList.push({rowIdx: rowIdx, colIdx: colIdx, piece: 'b', skip: false});
                }
            }

            if (!this.turnWhite) {
                this.pieceCounts.black = this.pieceCounts.black + reverceList.length;
                this.pieceCounts.white = this.pieceCounts.white - reverceList.length;
            } else {
                this.pieceCounts.white = this.pieceCounts.white + reverceList.length;
                this.pieceCounts.black = this.pieceCounts.black - reverceList.length;
            }

            gaming.objects.changePieces(states, changeList, 0, function(states) {
                states.turnWhite = !states.turnWhite;
                completion(true);
            });
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
        },
        getEndingMessage: function() {
            let counts = this.pieceCounts;
            let blackWin = counts.black >= counts.white;
            // Black wins a to b.
            return (blackWin ? 'Black' : 'White') + ' wins '
                + counts.black + ' to ' + counts.white + '.';
        }
    },
    pieceSelectionLogic: {
        getPieceSelections: function(states) {
            var selections = [];
            let boardMarix = states.boardMarix;
            for (let rowIdx = 0; rowIdx < boardMarix.length; rowIdx++) {
                for (let colIdx = 0; colIdx < boardMarix[rowIdx].length; colIdx++) {
                    let reverceList = states.getObtainablePiece(rowIdx, colIdx)
                    if (reverceList.length > 0) {
                        selections.push({
                            index: {
                                rowIdx: rowIdx, colIdx, colIdx
                            },
                            reverceList: reverceList
                        });
                    }
                }
            }
            return selections;
        },
        expactPieceSelections: function(gaming, selections, level) {
            let states = gaming.states;
            let max = gaming.pieceLineNum - 1;
            let maxm = max - 1;

            let rLevel1Idxs = [
                {rowIdx: 0, colIdx: 0}, {rowIdx: 0, colIdx: max},
                {rowIdx: max, colIdx: 0}, {rowIdx: max, colIdx: max}
            ];
            var _selections = selections;
            var filteringSelections = _selections.filter(function (selection) {
                return rLevel1Idxs.filter(function (idxs) {
                    return selection.index.rowIdx == idxs.rowIdx
                    && selection.index.colIdx == idxs.colIdx
                }).length > 0;
            });
            if (filteringSelections.length > 0) {
                return filteringSelections; 
            }

            let nRLevel2Idxs = [
                {rowIdx: 0, colIdx: 1}, {rowIdx: 1, colIdx: 0}, {rowIdx: 1, colIdx: 1},
                {rowIdx: max, colIdx:  1}, {rowIdx: maxm, colIdx: 0}, {rowIdx: maxm, colIdx: 1},
                {rowIdx: 1, colIdx: max}, {rowIdx: 0, colIdx: maxm}, {rowIdx: 1, colIdx: maxm},
                {rowIdx: maxm, colIdx: max}, {rowIdx: max, colIdx: maxm}, {rowIdx: maxm, colIdx: maxm}];
            filteringSelections = selections.filter(function (selection) {
                let c1 = nRLevel2Idxs.filter(function (idxs) {
                    return selection.index.rowIdx == idxs.rowIdx
                    && selection.index.colIdx == idxs.colIdx;
                }).length > 0;

                let c2 = nRLevel2Idxs.filter(function (idxs) {
                    return selection.reverceList.filter (function(index) {
                        return idxs.rowIdx == index.rowIdx
                        && idxs.colIdx == index.colIdx;
                    }).length > 0;
                }).length > 0;

                let c = !(c1 || c2);

                if (!c) {
                    console.log('c1=' + c1 + ' c2=' + c2);
                    console.log(selection);
                }

                return c;
            });
            if (filteringSelections.length > 0) {
                _selections = filteringSelections; 
            }

            var minNum = gaming.pieceLineNum ** 2;
            _selections.forEach(function (selection) {
                let count = selection.reverceList.length;
                if (count < minNum) {
                    minNum = count;
                }
            });
            var filteringSelections = _selections.filter(function (selection) {
                return selection.reverceList.length == minNum;                
            });
            if (filteringSelections.length > 0) {
                _selections = filteringSelections; 
            }

            return _selections
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
    info['seekScreenFitZoomRate'] = function (screenInfo) {
        let offset = screenInfo.getOffset();
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
};
setScreenRateFuncs(reversiBoardInfo);
setScreenRateFuncs(reversiPieceBlankInfo);
setScreenRateFuncs(reversiPieceBlackInfo);
setScreenRateFuncs(reversiPieceWhiteInfo);

function setBoardPieceRateFuncs(info) {
    info['seekScreenFitZoomRate'] = function (screenInfo) {
        let offsetX = screenInfo.getOffset().x
            + reversiBoardInfo.getBorderOffset(screenInfo).x;
        this['zoomRate'] = (screenInfo.width - offsetX * 2
            ) / reversiGaming.pieceLineNum / this.width;
    };

    info['getBoardIndexOffset'] = function (screenInfo, colIdx, rowIdx) {
        let zoomSize = this.getZoomSize();
        let borderOffset = reversiBoardInfo.getBorderOffset(screenInfo);
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
    backgroundColor: '#faf9f6',
    scene: {
        preload: function() {
            [reversiBoardInfo, reversiPieceBlankInfo, reversiPieceBlackInfo,
                reversiPieceWhiteInfo]
            .forEach(info => {
                info.seekScreenFitZoomRate(screenInfo);
                let size = info.getZoomSize();
                //console.log(size);

                var images = [];
                if (info.urls) {
                    for (let i in info.urls) {
                        images.push({
                            key: info.getKey(i), url: info.urls[i]
                        });
                    }
                } else {
                    images.push({
                        key: info.key, url: info.url
                    });
                }

                for (let i in images) {
                    let image = images[i];
                    this.load.svg(image.key, image.url, {
                        width: size.width,
                        height: size.height
                    });
                }
            })
        },
        create: function() {
            let gaming = reversiGaming;
            let states = gaming.states;
            let objects = gaming.objects;
            let pieces = objects.pieces;

            gaming.objects.game = this;

            states.initStates();

            {
                let info = reversiBoardInfo;
                let center = info.getCenter();
                let offset = screenInfo.getOffset();
                this.add.image(
                    center.x + offset.x,
                    center.y + offset.y,
                    info.key);
            }

            gaming.initBoardMatrix(pieces, null);
            for (let rowIdx = 0; rowIdx < pieces.length; rowIdx++) {
                for (let colIdx = 0; colIdx < pieces[rowIdx].length; colIdx++) {
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
    
                            let urls = info.urls;
                            if (urls) {
                                for (let i = 0; i < urls.length; i++) {
                                    t.piece.push(this.add.image(
                                        center.x + offset.x,
                                        center.y + offset.y,
                                        info.getKey(i)));
                                    if (t.interactive) {
                                        t.piece[i].setInteractive()
                                    }
                                    t.piece[i].setVisible(t.visible);
                                }
                            } else {
                                t.piece.push(this.add.image(
                                    center.x + offset.x,
                                    center.y + offset.y,
                                    info.getFirstKey()));
                                if (t.interactive) {
                                    t.piece[0].setInteractive()
                                }
                                t.piece[0].setVisible(t.visible);
                            }
                        });

                    // pieces[rowIdx][colIdx] = Object.keys(images).reduce((current, key) => {
                    //     current[key] = images[key][0];
                    //     return current;
                    // }, {});
                    pieces[rowIdx][colIdx] = images;
                }
            }

            objects.reflectPieces(states);

            {
                let fontSize = reversiBoardInfo.getCenterTextFontSize(screenInfo);
                //console.log(fontSize);
                objects.centerText = this.add.text(screenInfo.width / 2,
                    screenInfo.height / 2, 'Phaser 3')
                    .setFontSize(fontSize)
                    .setFontFamily("Arial")
                    .setColor('#ff00ff')
                    .setOrigin(0.5)
                    .setVisible(false);
            }
        
            // this.input.on('gameobjectdown', (pointer, gameobject) => {
            //     //console.log('d');
            // });
        
            this.input.on('gameobjectup', (pointer, gameobject) => {
                let gaming = reversiGaming;
                let objects = gaming.objects;
                let states = gaming.states;
                let index = objects.getPieceIndex(gameobject);

                // let endingMessage = states.getEndingMessage();
                // objects.centerText.setText(endingMessage);
                // objects.centerText.setVisible(true);

                if (states.end) {
                    initGame();
                    return;
                }

                states.selectPiece(index.rowIdx, index.colIdx, null, function(result) {
                    if (result) {
                        // console.log('--- user ---');
                        // console.log(index);
                        // console.log(states.boardMarix);
 
                        cpuTurn();
                    }
                });
                //console.log('u');
            });

            if (gaming.testMode) {
                this.input.enabled = false;
                cpuTurn();
            }
        },
        update: function() {
            //console.log('update')
        }
    }
});

// window.addEventListener("orientationchange", () => {
//     screenInfo.initSize();
//     game.scale.refresh();
// });

function cpuTurn() {
    let gaming = reversiGaming;
    let objects = gaming.objects;
    let states = gaming.states;
    let logic = gaming.pieceSelectionLogic;
    let pieceCounts = states.pieceCounts;

    var selections = logic.getPieceSelections(states);
    if (selections.length > 0) {
        if (states.turnWhite) {
            selections = logic.expactPieceSelections(gaming, selections, 0);
        }

        //let maxMs = 750;
        let minMs = 250;
        //let ms = (maxMs - minMs + 1) * Math.random() + minMs;
        objects.game.time.delayedCall(minMs, afterPieceSelection, [selections]);
    } else {
        if (pieceCounts.getSum() == gaming.pieceLineNum ** 2) {
            finalProcessing();
        } else if (!states.skipping) {
            states.turnWhite = !states.turnWhite;
            states.skipping = true;
            console.log('--- cpu(skip) ---');

            if (checkNextSelections) {
                if (gaming.testMode) {
                    cpuTurn();
                }
            }
        } else {
            finalProcessing();
        }
    }
}

function afterPieceSelection(selections) {
    let gaming = reversiGaming;
    let states = gaming.states;
    states.skipping = false;
    let i = Math.floor(Math.random() * selections.length);
    let selection = selections[i];
    let index = selection.index;
    // console.log('--- cpu ---');
    // console.log(index);

    states.selectPiece(index.rowIdx, index.colIdx, selection.reverceList, function(result) {
        if (result) {
            // console.log(states.boardMarix);
        
            if (checkNextSelections()) {
                if (gaming.testMode) {
                    cpuTurn();
                }
            }
        }
    });
}

function checkNextSelections() {
    let gaming = reversiGaming;
    let states = gaming.states;
    let nextSelections = gaming.pieceSelectionLogic.getPieceSelections(states);
    if (nextSelections.length > 0) {
        states.skipping = false;
    } else if (states.pieceCounts.getSum() == gaming.pieceLineNum ** 2) {
        finalProcessing();
        return false;
    } else if (!states.skipping) {
        states.turnWhite = !states.turnWhite;
        states.skipping = true;
        console.log('--- user(skip) ---');
    } else {
        finalProcessing();
        return false;
    }
    return true;
}

function finalProcessing() {
    let gaming = reversiGaming;
    let states = gaming.states;
    let objects = gaming.objects;
    let endingMessage = states.getEndingMessage();
    objects.centerText.setText(endingMessage);
    objects.centerText.setVisible(true);
    states.end = true;

    if (gaming.testMode) {
        states.end = false;
        objects.game.time.delayedCall(1000, initGame, []);
    }
}

function initGame() {
    let gaming = reversiGaming;
    let states = gaming.states;
    let objects = gaming.objects;

    states.initStates();
    objects.reflectPieces(states);
    objects.centerText.setVisible(false);

    if (gaming.testMode) {
        cpuTurn();
    }
}