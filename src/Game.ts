/**
 * Game.js
 * This is the main game object which controls gameloop and basically everything in the game
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
///<reference path="system/Camera.ts"/>
///<reference path="system/Graphics.ts"/>
///<reference path="system/AssetManager.ts"/>
///<reference path="system/Physics.ts"/>
///<reference path="Terrain.ts"/>
///<reference path="Worm.ts"/>
///<reference path="system/Utilies.ts"/>
///<reference path="gui/WeaponsMenu.ts" />
///<reference path="Player.ts" />
///<reference path="system/Timer.ts" />
///<reference path="Settings.ts" />
///<reference path="gui/CountDownTimer.ts" />
///<reference path="animation/SpriteDefinitions.ts" />
///<reference path="animation/ParticleEffect.ts"/>
///<reference path="animation/EffectsManager.ts"/>
///<reference path="gui/HealthMenu.ts"/>
///<reference path="Maps.ts"/>
///<reference path="GameStateManager.ts"/>
///<reference path="WormManager.ts"/>
///<reference path="networking/Client.ts"/>
///<reference path="networking/Lobby.ts"/>

class Game
{
    static types = {
        ONLINE_GAME: 0,
        LOCAL_GAME: 1
    };

    actionCanvas;
    actionCanvasContext;

    terrain: Terrain;
    players: Player[];

    gameType: number;

    weaponMenu: WeaponsMenu;
    healthMenu: HealthMenu;
    gameTimer: CountDownTimer;

    wormManager: WormManager;
    state: GameStateManager;

    particleEffectMgmt: EffectsManager;
    miscellaneousEffects: EffectsManager;

    lobby : Lobby;

    winner: Player;

    // TODO clean this up -just made it static to get it working
    static map: Map = new Map(Maps.priates);

    camera: Camera;

    //Using in dev mode to collect spawn positions
    spawns;

    constructor ()
    {
        Graphics.init();

        //Create action canvas
        this.actionCanvas = Graphics.createCanvas("action");
        this.actionCanvasContext = this.actionCanvas.getContext("2d");
        

        //Set canvas font stuff
        this.actionCanvasContext.font = 'bold 16px Sans-Serif';
        this.actionCanvasContext.textAlign = 'center';

        Physics.init(this.actionCanvasContext);

        this.terrain = new Terrain(this.actionCanvas, Game.map.getTerrainImg(), Game.map.getBackgroundCss(), Physics.world, Physics.worldScale);
        this.camera = new Camera(this.terrain.getWidth(), this.terrain.getHeight(), this.actionCanvas.width, this.actionCanvas.height);

        // Manages the state of the game, the player turns etc.
        this.state = new GameStateManager();

        this.players = [];

        // Development stuff
        this.spawns = [];
        if (Settings.DEVELOPMENT_MODE)
        {
            window.addEventListener("click", function (evt: any) =>
            {
                this.particleEffectMgmt.add(new ParticleEffect(this.camera.getX() + evt.pageX, this.camera.getY() + evt.pageY));
                this.spawns.push(new b2Vec2(this.camera.getX() + evt.pageX, this.camera.getY() + evt.pageY));
                Logger.log(JSON.stringify(this.spawns));

            }, false);
        }

         this.lobby = new Lobby();
    
    }

    start(playerIds = null)
    {
        
        if (this.gameType == Game.types.LOCAL_GAME)
        {
            for (var i = 0; i < 2; i++)
            {
                this.players.push(new Player());
            }

        } else if (this.gameType == Game.types.ONLINE_GAME)
        {

            for (var i = 0; i < playerIds.length; i++)
            {
                  this.players.push(new Player(playerIds[i]));
            }
        }

        this.state.init(this.players);

        //TODO finish this
        var clientsPlayer = Utilies.findByValue(Client.id, this.players, 'id');
        this.state.setCurrentPlayer();

        // Allows for a easily accissble way of asking questions of all worms regardless of team
        this.wormManager = new WormManager(this.players);

        // Initalizes UI elements
        this.gameTimer = new CountDownTimer();
        this.weaponMenu = new WeaponsMenu();
        this.healthMenu = new HealthMenu(this.players);

        // Initalizse the various animations/effect managers
        this.particleEffectMgmt = new EffectsManager();
        this.miscellaneousEffects = new EffectsManager();


        this.healthMenu.show();
        this.gameTimer.show();
        this.weaponMenu.show();

        this.gameTimer.timer.reset();

        // Need to fire the menu call back to remove it and start the game
        
        if (this.gameType == Game.types.ONLINE_GAME)
        {
            StartMenu.callback();
        }
    }

    update()
    {
        if (this.state.isStarted)
        {

            // while no winner, check for one
            if (this.winner == null)
            {
                this.winner = this.state.checkForWinner();

                if (this.winner)
                {
                    this.gameTimer.timer.pause();
                    this.winner.getTeam().celebrate();
                }
            }

            // When ready to go to the next player and while no winner
            if (this.state.readyForNextTurn() && this.winner == null)
            {
                this.state.nextPlayer();
                this.gameTimer.timer.reset();
            }

            for (var i = this.players.length - 1; i >= 0; --i)
            {
                this.players[i].update();
            }

            this.terrain.update();
            this.camera.update();
            this.particleEffectMgmt.update();
            this.miscellaneousEffects.update();
            this.gameTimer.update();
        }

    }

    step()
    {
        if (this.state.isStarted)
        {
            Physics.world.Step(
                  (1 / 60)
               , 10       //velocity iterations
               , 10       //position iterations
            );
        }
        //Physics.world.ClearForces();
    }

    draw()
    {

        this.actionCanvasContext.clearRect(0, 0, this.actionCanvas.width, this.actionCanvas.height);
        this.terrain.draw(this.actionCanvasContext);

        this.actionCanvasContext.save();
        this.actionCanvasContext.translate(-this.camera.getX(), -this.camera.getY());

        if (Settings.PHYSICS_DEBUG_MODE)
        {
            Physics.world.DrawDebugData();
        }

        for (var i = this.players.length - 1; i >= 0; --i)
        {
            this.players[i].draw(this.actionCanvasContext);
        }

        this.miscellaneousEffects.draw(this.actionCanvasContext);
        this.particleEffectMgmt.draw(this.actionCanvasContext);

        this.actionCanvasContext.restore();

    }

}