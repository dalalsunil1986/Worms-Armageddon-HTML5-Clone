/**
 * WormManager.js
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
///<reference path="system/Camera.ts"/>
///<reference path="system/Graphics.ts"/>
///<reference path="system/AssetManager.ts"/>
///<reference path="system/Physics.ts"/>
///<reference path="Worm.ts"/>
///<reference path="system/Utilies.ts"/>
///<reference path="system/Timer.ts" />
///<reference path="Settings.ts" />

class WormManager
{

    allWorms: Worm[];

    constructor (players : Player[])
    {
        this.allWorms = [];

        // Get a reference to all the worms from each team
        // for fast acessing, when asking quetions of all them.
        for (var i = 0; i < players.length; i++)
        {
            var worms = players[i].getTeam().getWorms();
            for (var j = 0; j < worms.length; j++)
            {
                this.allWorms.push(worms[j]);
            }
        }

        Logger.log( this.allWorms);
    }

    // are all the worms completely finished, animations, health reduction, actions etc.
    areAllWormsReadyForNextTurn()
    {
        return WormAnimationManger.playerAttentionSemaphore == 0 && this.areAllWormsStationary() && this.areAllWormsDamageTaken() && this.areAllWeaponsDeactived();
    }

    // Are all the worms stop, not moving at all. 
    areAllWormsStationary()
    {

        ////TODO should use this
        //every Requires JavaScript 1.6
        //Returns true if every element in this array satisfies the provided testing function.

        for (var i = 0; i < this.allWorms.length; i++)
        {
            if (this.allWorms[i].isStationary() == false)
            {
                return false;
            }
        }

        return true;
    }

     // Are all the worms stop, not moving at all. 
    areAllWeaponsDeactived()
    {
        for (var i = 0; i < this.allWorms.length; i++)
        {
            if (this.allWorms[i].team.getWeaponManager().getCurrentWeapon().getIsActive() == true)
            {
                return false;
            }
        }

        return true;
    }

    //deactivate all non-time based weapons, such as jetpacks and ropes etc. 
    deactivedAllNonTimeBasedWeapons()
    {
        for (var i = 0; i < this.allWorms.length; i++)
        {
            var weapon = this.allWorms[i].team.getWeaponManager().getCurrentWeapon();
            if (weapon.getIsActive() == true)
            {
                if ((weapon instanceof ThrowableWeapon) == false)
                {
                    weapon.deactivate();
                }
            }
        }

        return true;
    }

    // Are all worm accumlated damage pionts taken from their total health yet?
    areAllWormsDamageTaken()
    {
        for (var i = 0; i < this.allWorms.length; i++)
        {
            if (this.allWorms[i].damageTake != 0)
            {
                return false;
            }

            // May have taken the health away but are now waiting for the death squence to start, so contine to return false
            if (this.allWorms[i].getHealth() == 0 && this.allWorms[i].damageTake == 0 && this.allWorms[i].isDead == false)
            {
                return false;
            }
        }

        return true;
    }


}