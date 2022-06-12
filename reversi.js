var screenInfo = {
    width: window.innerWidth <= window.innerHeight
        ? window.innerWidth : window.innerHeight,
    height: window.innerHeight,
    offsetRate: {
        x: 0.05, y: 0.05
    }
};

var reversiBoardInfo = {
    key: 'reversi_board',
    url: 'assets/reversi_board_505x505.svg',
    width: 505,
    height: 505,
    borderOffsetRate: {
        x: 0.015, y: 0.015
    }
};

var reversiPieceBlankInfo = {
    key: 'reversi_piece_blank',
    url: 'assets/reversi_piece_blank_61x61.svg',
    width: 61,
    height: 61
}

var reversiPieceBlackInfo = {
    key: 'reversi_piece_black',
    url: 'assets/reversi_piece_black_61x61.svg',
    width: 61,
    height: 61
}

var reversiPieceWhiteInfo = {
    key: 'reversi_piece_white',
    url: 'assets/reversi_piece_white_61x61.svg',
    width: 61,
    height: 61
}

var reversiGaming = {
    pieceLineNum: 8,
    images: {
        pieces: new Array(this.pieceLineNum),
        getPieceIndexs: function(image) {
            for (let rowIdx in this.pieces) {
                for (let colIdx in this.pieces[rowIdx]) {
                    let images = this.pieces[rowIdx][colIdx];
                    //if (images.filter(imageSet => imageSet.blank == image).length == 1) {
                    if (images.blank == image) {
                        return {
                            rowIdx: rowIdx, colIdx: colIdx
                        };
                    }
                }
            }
        }
    },
    states: {
        boardMarix: new Array(this.pieceLineNum),
        initStates: function () {
            reversiGaming.initBoardMatrix(this.boardMarix, "e");
            this.boardMarix[3][3] = "w";
            this.boardMarix[3][4] = "b";
            this.boardMarix[4][3] = "b";
            this.boardMarix[4][4] = "w";
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
        var offset = this.getOffset(screenInfo);
        var offsetY = offset.y
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
        var offsetX = this.getOffset(screenInfo).x
            + this.getBorderOffset().x;
        this['zoomRate'] = (screenInfo.width - offsetX * 2
            ) / reversiGaming.pieceLineNum / this.width;
    };

    info['getBoardIndexOffset'] = function (screenInfo, colIdx, rowIdx) {
        var zoomSize = this.getZoomSize();
        var borderOffset = this.getBorderOffset();
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

var game = new Phaser.Game({
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
                var size = info.getZoomSize();
                console.log(size);
                this.load.svg(info.key, info.url, {
                    width: size.width,
                    height: size.height
                });
            })
        },
        create: function() {
            var gaming = reversiGaming;
            var states = gaming.states;
            states.initStates();

            {
                var info = reversiBoardInfo;
                var center = info.getCenter();
                var offset = info.getOffset(screenInfo);
                this.add.image(
                    center.x + offset.x,
                    center.y + offset.y,
                    info.key);
            }

            var pieces = gaming.images.pieces;
            gaming.initBoardMatrix(pieces, null);
            for (let rowIdx in pieces) {
                for (let colIdx in pieces[rowIdx]) {
                    var images = {
                        blank: [],
                        black: [],
                        white: []
                    };

                    [{info: reversiPieceBlankInfo, piece: images.blank, visible: true},
                        {info: reversiPieceBlackInfo, piece: images.black, visible: false},
                        {info: reversiPieceWhiteInfo, piece: images.white, visible: false}]
                        .forEach(t => {
                            var info = t.info;
                            var center = info.getCenter();
                            var offset = info.getBoardIndexOffset(screenInfo, colIdx, rowIdx);
    
                            t.piece.push(this.add.image(
                                center.x + offset.x,
                                center.y + offset.y,
                                info.key).setInteractive());
                            t.piece[0].setVisible(t.visible);
                        });

                    pieces[rowIdx][colIdx] = Object.keys(images).reduce((current, key) => {
                        current[key] = images[key][0];
                        return current;
                    }, {});
                }
            }

            for (let rowIdx in pieces) {
                for (let colIdx in pieces[rowIdx]) {
                    var state = states.boardMarix[rowIdx][colIdx];
                    var piece = pieces[rowIdx][colIdx];
                    switch (state) {
                        case 'e':
                            piece.black.setVisible(false);
                            piece.white.setVisible(false);
                            break;
                        case 'b':
                            piece.black.setVisible(true);
                            piece.white.setVisible(false);
                            break;
                        case 'w':
                            piece.black.setVisible(false);
                            piece.white.setVisible(true);
                            break;
                    }
                }
            }
        
            // this.input.on('gameobjectdown', (pointer, gameobject) => {
            //     //console.log('d');
            // });
        
            this.input.on('gameobjectup', (pointer, gameobject) => {
                let index = gaming.images.getPieceIndexs(gameobject);
                console.log(index);
                //console.log('u');
            });
        },
        update: function() {
            //console.log('update')
        }
    }
});
