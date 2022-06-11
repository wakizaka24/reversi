var screenSize = {
    width: window.innerWidth <= window.innerHeight
        ? window.innerWidth : window.innerHeight,
    height: window.innerHeight
};

var pressButtonInfo = {
    key: 'press_button',
    url: 'assets/reversi_board_500x500.svg',
    width: 500,
    height: 500,
    zoomRate: 1,
    offsetRate: {
        x: 0.05, y: 0.05
    },
    getZoomSize: function () {
        return {
            width: this.width * this.zoomRate,
            height: this.height * this.zoomRate
        };
    },
    getCenter: function () {
        return {
            x: this.getZoomSize().width / 2,
            y: this.getZoomSize().height / 2
        }
    },
    getOffset: function (screenSize) {
        return {
            x: screenSize.width * this.offsetRate.x,
            y: screenSize.width * this.offsetRate.y,
        }
    },
    getCenterOffset: function (screenSize, itemSize) {
        return {
            x: (screenSize.width - itemSize.width) * 0.5,
            y: (screenSize.height - itemSize.height) * 0.5,
        }
    },
    seekScreenFitZoomRate: function (screenSize) {
        var offset = this.getOffset(screenSize);
        var offsetY = offset.y
        this['zoomRate'] = (screenSize.width - offsetY * 2) / this.width;
    }
};

function addScreenRateFuncs(info) {

};

var flag = false;

var game = new Phaser.Game({
    type: Phaser.WEBGL,
    width: screenSize.width,
    height: screenSize.height,
    backgroundColor: '#FAF9F6',
    scene: {
        preload: function() {
            {
                var info = pressButtonInfo;
                info.seekScreenFitZoomRate(screenSize);
                var size = info.getZoomSize();
                console.log(size);
                this.load.svg(info.key, info.url, {
                    width: size.width,
                    height: size.height
                });
            }
        },
        create: function() {
            var pressButton;
            {
                var info = pressButtonInfo;
                var center = info.getCenter();
                var offset = info.getOffset(screenSize);
                var itemSize = info.getZoomSize();
                var centerOffset = info.getCenterOffset(screenSize, itemSize);
                pressButton = this.add.image(
                    center.x + offset.x,
                    center.y + centerOffset.y,
                    info.key).setInteractive();
            }
        
            this.input.on('gameobjectdown', (pointer, gameobject) => {
                if (gameobject === pressButton) {
                    console.log('d')
                }
            });
        
            this.input.on('gameobjectup', (pointer, gameobject) => {
                if (gameobject === pressButton) {
                    var scale = !flag ? 0.75 : 1
                    flag = !flag
                    pressButton.setScale(scale);
                    console.log('u')
                }
            });
        },
        update: function() {
            //console.log('update')
        }
    }
});
