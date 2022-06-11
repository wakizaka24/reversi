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
    url: 'assets/reversi_board_500x500.svg',
    width: 500,
    height: 500,
    borderOffsetRate: {
        x: 0.008, y: 0.008
    }
};

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

function addScreenRateFuncs(info) {
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
addScreenRateFuncs(reversiBoardInfo);
addScreenRateFuncs(reversiPieceBlackInfo);
addScreenRateFuncs(reversiPieceWhiteInfo);

function addBoardPieceRateFuncs(info) {
    info['seekScreenFitZoomRate'] = function (screenInfo) {
        var offset = this.getOffset(screenInfo);
        var offsetY = offset.y
        this['zoomRate'] = (screenInfo.width - offsetY * 2) / 8 / this.width;
    };

    info['getBoardIndexOffset'] = function (screenInfo, colIdx, rowIdx) {
        var zoomSize = this.getZoomSize();
        return {
            x: screenInfo.width * screenInfo.offsetRate.x
                + screenInfo.width * reversiBoardInfo.borderOffsetRate.x
                + zoomSize.width * colIdx,
            y: screenInfo.width * screenInfo.offsetRate.y
                + screenInfo.width * reversiBoardInfo.borderOffsetRate.y
                + zoomSize.height * rowIdx,
        }
    };


}
addBoardPieceRateFuncs(reversiPieceBlackInfo);
addBoardPieceRateFuncs(reversiPieceWhiteInfo);

var flag = false;

var game = new Phaser.Game({
    type: Phaser.WEBGL,
    width: screenInfo.width,
    height: screenInfo.height,
    backgroundColor: '#FAF9F6',
    scene: {
        preload: function() {
            {
                var info = reversiBoardInfo;
                info.seekScreenFitZoomRate(screenInfo);
                var size = info.getZoomSize();
                console.log(size);
                this.load.svg(info.key, info.url, {
                    width: size.width,
                    height: size.height
                });
            }

            {
                var info = reversiPieceBlackInfo;
                info.seekScreenFitZoomRate(screenInfo);
                var size = info.getZoomSize();
                console.log(size);
                this.load.svg(info.key, info.url, {
                    width: size.width,
                    height: size.height
                });
            }
        },
        create: function() {
            {
                var info = reversiBoardInfo;
                var center = info.getCenter();
                var offset = info.getOffset(screenInfo);
                this.add.image(
                    center.x + offset.x,
                    center.y + offset.y,
                    info.key);
            }

            var blackPiece;

            for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
                for (let colIdx = 0; colIdx < 8; colIdx++) {
                    var info = reversiPieceBlackInfo;
                    var center = info.getCenter();
                    var offset = info.getBoardIndexOffset(screenInfo, colIdx, rowIdx);
                    blackPiece = this.add.image(
                        center.x + offset.x,
                        center.y + offset.y,
                        info.key).setInteractive();

                }
            }
        
            this.input.on('gameobjectdown', (pointer, gameobject) => {
                if (gameobject === blackPiece) {
                    console.log('d')
                }
            });
        
            this.input.on('gameobjectup', (pointer, gameobject) => {
                if (gameobject === blackPiece) {
                    var scale = !flag ? 0.75 : 1
                    flag = !flag
                    blackPiece.setScale(scale);
                    //blackPiece.setVisible(false);
                    console.log('u')
                }
            });
        },
        update: function() {
            //console.log('update')
        }
    }
});
