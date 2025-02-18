/** @type HTMLCanvasElement */
let image_arr = ['background-1.jpg', 'player2.png', 'enemy1.png', 'ship_1.png', 'ship_2.png', 'aestroid_dark.png', 'bullet1.png', 'fuel.png', '001-global.png', '002-travel.png', '006-mars.png']
let load_flag = 0
let images = []
let flies = []
let bullets = []
let score = document.getElementById("score");
// let pl_fuel = document.getElementById("hp");
let id = 0
let planes = []
let c_game

let time = document.querySelector('.time'),
    seconds = 0,
    ms = 0,
    mms = 0,
    timer = null
time.innerHTML = `${seconds}:${ms}${mms}`
const hpBar = document.querySelector('.hp'),
    block = document.querySelector('.hp li'),
    hurtBtn = document.querySelector('.hurt'),
    healBtn = document.querySelector('.heal')


let game_state = true

if (true) {
    clearInterval(timer)
    timer = setInterval(() => {
        if (mms === 9) {
            // seconds++
            ms++
            mms = 0
        }
        if (ms === 9) {
            seconds++
            ms = 0
        }
        mms++
        time.innerHTML = `${seconds}s`
    }, 10)
}

image_arr.forEach((v) => {
    let img = new Image()
    img.src = './img/' + v
    img.onload = () => {
        load_flag++
        check_load()
    }
    images.push(img)
})

let check_load = () => {
    if (load_flag == image_arr.length) {
        c_game = new canvas_game()
    }
}

let bk = (obj1, obj2) => {
    if (obj2.x < obj1.x + obj1.w && obj2.x + obj2.w > obj1.x && obj2.y < obj1.y + obj1.h && obj2.y + obj2.h > obj1.y) {
        return true
    } else {
        return false
    }
}

class bullet {
    constructor(type, obj) {
        this.id = ++id
        this.x = obj.x + 65 - 15
        this.y = obj.y + 25 - 5
        this.w = 30
        this.h = 12
        this.type = type
        bullets[this.id] = this
        // document.querySelector('.shoot').cloneNode().play()
    }

    refresh() {
        if (this.x < -50 || this.x > 1700) {
            this.remove()
        }
    }

    remove() {
        delete bullets[this.id]
    }
}

class fly {
    constructor(type) {
        this.id = ++id
        this.type = type
        this.life = 1
        this.w = 70
        this.h = 70
        this.deg = 0
        if (type == 'fuel') {
            this.x = Math.floor(Math.random() * (600 - 50))
            this.y = -50
        } else {
            this.x = 960
            this.y = Math.floor(Math.random() * (600 - 50))
        }

        if (type == 'enemy') {
            this.shoot = setInterval(() => {
                new bullet('enemy', this);
            }, Math.random() * (2000) + 1000);
        }

        if (type == 'stone') {
            this.life = 2
        }

        if (type == 'fuel') {
            this.w = 40
            this.h = 40
        }

        flies[this.id] = this
        this.refresh()
    }

    // 检测有没有超出屏幕
    refresh() {
        if (this.x < -65 || this.y > 600) {
            this.remove()
        }
    }

    remove() {
        delete flies[this.id]


        clearInterval(this.shoot);
    }
}


class player {
    constructor() {
        this.x = 0
        this.y = 0
        this.w = 60
        this.h = 60
    }
}

class plane {
    constructor() {
        this.id = ++id
        let wh_rand = [100, 200, 300, 400, 500]
        this.wh = wh_rand[Math.floor(Math.random() * wh_rand.length)]

        this.x = 960
        this.y = Math.floor(Math.random() * (600 - this.wh / 2))
        this.w = this.wh
        this.h = this.wh
        this.rand_image = Math.ceil(Math.random() * 3 + 7)
        this.filter = Math.random() * 90;
        planes[this.id] = this
        this.refresh()
    }

    refresh() {
        if (this.x < -this.wh) {
            this.remove()
        }
    }

    remove() {
        delete planes[this.id]
    }
}

class canvas_game {
    constructor() {
        this.pl_fuel = 5
        this.score = 0;
        this.bg_x = 0
        this.frame_nm = 0
        this.fly_ani_nm = 0

        this.m_up = false
        this.m_down = false
        this.m_left = false
        this.m_right = false
        this.m_space = false

        this.player = {
            x: 0,
            y: 0,
            w: 50,
            h: 50,
        }

        this.init()
        this.init_event()
        this.render()
    }
    init() {
        this.canvas = document.querySelector('.canvas')
        this.ctx = this.canvas.getContext('2d')
        for (let i = 1; i <= this.pl_fuel; i++) {
            hpBar.innerHTML += `<li></li>`
        }
    }

    
    hurt() {
        hpBar.innerHTML = ``
        for (let i = 1; i <= this.pl_fuel; i++) {
            hpBar.innerHTML += `<li></li>`
        }
    
        const lastLi = document.querySelector('.hp li:last-child')
        lastLi.style.animation = 'hurt1 1.5s forwards'
        hpBar.style.animation = 'shake .5s'
        this.pl_fuel--
        setTimeout(() => {
            hpBar.style.animation = ''
        }, 500);
        console.log(this.pl_fuel)
    }
    
    heal() {
        // hp > 5 ? hp = 5 : hp
        if (this.pl_fuel < 5) {
            this.pl_fuel++
            hpBar.innerHTML = ``
            for (let i = 1; i <= this.pl_fuel; i++) {
                hpBar.innerHTML += `<li></li>`
            }
            const lastLi = document.querySelector('.hp li:last-child')
            lastLi.style.animation = 'heal 1s forwards'
        }else {
            this.score += 10
            score.innerHTML = parseInt(score.innerHTML) + 10;
        }
        console.log(this.pl_fuel)
    }

    init_event() {
        document.onkeydown = (e) => {
            // 这里其实就是限制每次只判断一次 一开始我不知道，然后按住空格就可以高速射子弹，把发射子弹也加入true flase判定，就可以实现判断发射子弹的效果
            if (e.keyCode === 38 || e.keyCode === 87) {
                this.m_up = true
            } else if (e.keyCode === 40 || e.keyCode === 83) {
                this.m_down = true
            } else if (e.keyCode === 37 || e.keyCode === 65) {
                this.m_left = true
            } else if (e.keyCode === 39 || e.keyCode === 68) {
                this.m_right = true
            } else if (e.key == ' ' && this.m_space == false) {
                new bullet('player', this.player)
            }
        }

        document.onkeyup = (e) => {
            if (e.keyCode === 38 || e.keyCode === 87) {
                this.m_up = false
            } else if (e.keyCode === 40 || e.keyCode === 83) {
                this.m_down = false
            } else if (e.keyCode === 37 || e.keyCode === 65) {
                this.m_left = false
            } else if (e.keyCode === 39 || e.keyCode === 68) {
                this.m_right = false
            }
        }
    }

    draw_bg() {
        this.bg_x -= 3
        if (this.bg_x <= -960) {
            this.bg_x = 0
        }
        this.ctx.drawImage(images[0], 0 + this.bg_x, 0, 960, 600)
        this.ctx.drawImage(images[0], 960 + this.bg_x, 0, 960, 600)
    }

    // 生成飞行物 调整出现频率
    create_flies() {
        if (this.frame_nm / 100 % 2 == 0) {
            new fly('enemy')
        }

        if (this.frame_nm / 100 % 3 == 0) {
            new fly('friend')
        }

        if (this.frame_nm / 100 % 4 == 0) {
            new fly('stone')
        }

        if (this.frame_nm / 100 % 4 == 0) {
            new plane()
        }

        if (this.frame_nm / 100 % 6 == 0) {
            new fly('fuel')
        }
    }   // +parseInt(Math.random()*800),

    draw_player() {

        if (this.m_up) {
            this.player.y -= 7
            if (this.player.y < 0) {
                this.player.y = 0
            }
        }
        if (this.m_down) {
            if (this.player.y > 600 - 65) {
                this.player.y = 600 - 65
            }
            this.player.y += 7
        }
        if (this.m_left) {
            this.player.x -= 7
            if (this.player.x < 0) {
                this.player.x = 0
            }
        }
        if (this.m_right) {
            this.player.x += 7
            if (this.player.x > 900) {
                this.player.x = 900
            }
        }
        // if(this.m_space){
        // setTimeout(() => {
        //         new bullet('player',this.player)
        //     }, 100);
        // }

        if (this.frame_nm % 8 == 0) {
            this.pl_ani_nm++
            if (this.pl_ani_nm > 3) {
                this.pl_ani_nm = 0
            }
        }

        this.ctx.drawImage(images[1], this.player.x, this.player.y, 60, 60)
    }

    draw_flies() {
        if (this.frame_nm % 8 == 0) {
            this.fly_ani_nm++
            if (this.fly_ani_nm > 3) {
                this.fly_ani_nm = 0
            }
        }

        flies.forEach(obj => {
            if (obj.type == 'enemy') {
                this.ctx.drawImage(images[3], this.fly_ani_nm * 80, 0, 80, 81, obj.x, obj.y, 70, 70)
            }
            if (obj.type == 'friend') {
                this.ctx.drawImage(images[4], this.fly_ani_nm * 80, 0, 80, 81, obj.x, obj.y, 70, 70)
            }
            if (obj.type == 'stone') {
                this.ctx.save()

                this.ctx.translate(obj.x + obj.w / 2, obj.y + obj.h / 2)
                obj.deg += 2
                this.ctx.rotate(obj.deg * Math.PI / 180)
                this.ctx.drawImage(images[5], 0 - obj.w / 2, 0 - obj.h / 2, 80, 80)
                this.ctx.restore()
            }
            if (obj.type == 'fuel') {
                this.ctx.drawImage(images[7], obj.x, obj.y, 40, 40)
            }
        })
    }

    draw_bullets() {
        bullets.forEach(obj => {
            this.ctx.drawImage(images[6], obj.x, obj.y, obj.w, obj.h)
        })
    }

    draw_plane() {
        planes.forEach(obj => {
            this.ctx.drawImage(images[obj.rand_image], obj.x, obj.y, obj.w, obj.h)
        })
    }

    draw() {
        if (this.pl_fuel <= 0) {
            game_state = false
            setTimeout(() => {
                // alert('Game Over')
                document.location.href = './GG.html'
            }, 1000)
        }
        if (this.score >= 200) {
            setTimeout(() => {
                alert('You did it')
            }, 15)
            document.location.href = './win.html'
        }
        this.draw_bg()
        this.draw_plane()
        this.draw_player()
        this.draw_flies()
        this.draw_bullets()
    }

    check_break() {
        for (let k in bullets) {
            if (bullets[k].type == 'player') {
                for (let i in flies) {
                    if (bk(flies[i], bullets[k])) {
                        if (--flies[i].life == 0) {
                            if (flies[i].type == 'enemy') {
                                bullets[k].remove()
                                flies[i].remove()
                                this.score += 10
                                score.innerHTML = parseInt(score.innerHTML) + 10;

                            } else if (flies[i].type == 'friend') {
                                bullets[k].remove()
                                flies[i].remove()
                                this.score -= 10
                                score.innerHTML = parseInt(score.innerHTML) - 5;

                            } else if (flies[i].type == 'stone') {
                                bullets[k].remove()
                                flies[i].remove()
                                this.score += 15
                                score.innerHTML = parseInt(score.innerHTML) + 15;

                            } else if (flies[i].type == 'fuel') {
                                bullets[k].remove()
                                flies[i].remove()
                            }
                            // document.querySelector('.destroyed').cloneNode().play()
                        } else {
                            bullets[k].remove()
                        }

                        break
                    }
                }
            } else {
                if (bk(this.player, bullets[k])) {
                    bullets[k].remove()
                    this.hurt()
                }
            }
        }

        for (let i in flies) {
            if (bk(flies[i], this.player)) {

                if (flies[i].type == 'enemy') {
                    this.hurt()
                    flies[i].remove()
                    // document.querySelector('.destroyed').cloneNode().play()
                } else if (flies[i].type == 'friend') {
                    this.hurt()
                    flies[i].remove()
                    // document.querySelector('.destroyed').cloneNode().play()
                } else if (flies[i].type == 'stone') {
                    this.hurt()
                    flies[i].remove()
                    // document.querySelector('.destroyed').cloneNode().play()
                } else if (flies[i].type == 'fuel') {
                    this.heal()
                    // document.querySelector('.destroyed').cloneNode().play()
                    flies[i].remove()
                }

                break
            }
        }
    }


    render() {
        this.frame_nm++
        this.check_break()
        this.create_flies()

        for (let i in flies) {
            if (flies[i].type == 'fuel') {
                flies[i].y += 1
            } else if (flies[i].type == 'xq') {
                flies[i].x -= 1
            } else if (flies[i].type == 'stone') {
                flies[i].x -= 3
            } else {
                flies[i].x -= 2
            }
            flies[i].refresh()
        }

        for (let i in bullets) {
            if (bullets[i].type == 'player') {
                bullets[i].x += 8
            } else {
                bullets[i].x -= 8
            }
            bullets[i].refresh()
        }

        for (let i in planes) {
            if (planes[i].wh == 500) {
                planes[i].x -= 4
            } else if (planes[i].wh == 400) {
                planes[i].x -= 3.5
            } else if (planes[i].wh == 300) {
                planes[i].x -= 3
            } else if (planes[i].wh == 200) {
                planes[i].x -= 2.5
            } else {
                planes[i].x -= 2
            }

            planes[i].refresh()
        }

        this.ctx.clearRect(0, 0, 960, 600)
        this.draw()
        if(game_state == true) {
            requestAnimationFrame(() => {
                this.render()
            })
        }
    }
}