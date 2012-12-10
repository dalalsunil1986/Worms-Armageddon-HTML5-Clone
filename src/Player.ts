/**
 * Player
 * The player class contains a team objects, which is the team of worms. 
 * It also defines the controls for the worms movements.
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
///<reference path="Team.ts"/>
///<reference path="system/Utilies.ts"/>
///<reference path="system/Timer.ts"/>
///<reference path="system/Controls.ts"/>

class Player
{
    private team: Team;
    private timer: Timer;
    private hasPlayerFiredWeapon;
    turnFinished;

    constructor ()
    {
        this.team = new Team();
        this.timer = new Timer(2000);
        this.hasPlayerFiredWeapon = false;
        this.turnFinished = false;


        //TODO refactor all control code into central Controls.ts when adding gamepad
        //$('body').mousedown(function (event) =>
        //{
        //    if (Controls.checkControls( Controls.fire, event.which))
        //    {
        //          this.team.getCurrentWorm().fire();
        //    }
        //});
    }

    getTeam()
    {
        return this.team;
    }

    update()
    {


        if (keyboard.isKeyDown(Controls.walkLeft.keyboard))
        {
            this.team.getCurrentWorm().walkLeft();
        }

        if (keyboard.isKeyDown(Controls.jump.keyboard))
        {
            this.team.getCurrentWorm().jump();
        }

        if (keyboard.isKeyDown(Controls.walkRight.keyboard))
        {
            this.team.getCurrentWorm().walkRight();
        }

        if (keyboard.isKeyDown(Controls.aimUp.keyboard))
        {
            this.team.getCurrentWorm().target.aim(1);

            //TODO Remove once movement code is refacted
            if (this.team.getWeaponManager().getCurrentWeapon() instanceof NinjaRope&&
                GameInstance.getCurrentPlayerObject().getTeam().getCurrentWorm() == this.team.getCurrentWorm())
            {
                var currentWeapon = <NinjaRope>this.team.getWeaponManager().getCurrentWeapon();
                if ( currentWeapon.isActive)
                {
                     currentWeapon.contract();
                }
            }
        }

        if (keyboard.isKeyDown(Controls.aimDown.keyboard))
        {
            this.team.getCurrentWorm().target.aim(-1);

            //TODO Remove once movement code is refacted
            if (this.team.getWeaponManager().getCurrentWeapon() instanceof NinjaRope &&
                GameInstance.getCurrentPlayerObject().getTeam().getCurrentWorm() == this.team.getCurrentWorm())
            {
                var currentWeapon = <NinjaRope>this.team.getWeaponManager().getCurrentWeapon();
                if ( currentWeapon.isActive)
                {
                    currentWeapon.expand();
                }
            }
        }

        if (keyboard.isKeyDown(Controls.fire.keyboard) && !this.hasPlayerFiredWeapon)
        {
            this.hasPlayerFiredWeapon = true;
            window.setTimeout(function () =>
            {
                this.hasPlayerFiredWeapon = false;
            }, 5000);
            this.team.getCurrentWorm().fire();
            //GameInstance.nextPlayer();

        }


        if (keyboard.isKeyDown(38)) //up
        {
            GameInstance.camera.cancelPan();
            GameInstance.camera.incrementY(-15)
        }

        if (keyboard.isKeyDown(40)) //down
        {
            GameInstance.camera.cancelPan();
            GameInstance.camera.incrementY(15)
        }


        if (keyboard.isKeyDown(37)) //left
        {
            GameInstance.camera.cancelPan();
            GameInstance.camera.incrementX(-15)
        }


        if (keyboard.isKeyDown(39)) //right
        {
            GameInstance.camera.cancelPan();
            GameInstance.camera.incrementX(15)
        }


        //if (this.hasPlayerFiredWeapon)
        //{
        //    this.timer.update();
        //}

        //if (this.timer.hasTimePeriodPassed())
        //{
        //        GameInstance.nextPlayer();
        //}

        //this.team.update();

    }

    draw(ctx)
    {
        this.team.draw(ctx);
    }


}