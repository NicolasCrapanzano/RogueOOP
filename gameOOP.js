class Entity {
    constructor(name="entity",x=0,y=0,maxHp,currentHp,entityType,game,globalID) {
        this.name = name;
        this.maxHp = maxHp;
        this.currentHp = currentHp;

        this.entityGlobalID=globalID;
        this.positionX = x;
        this.positionY = y;

        this.gameRef = game;
        this.ready = false;
        
        this.entitySpecs = entityType;
        this.scale = game.scale;

        this.description;
        this.init();
    }

    init(){
        this.ready = true;
    }
    update(){

    }

    draw(ctx,x,y){
        if(x === this.positionX && y === this.positionY){
            ctx.drawImage(
                this.gameRef.tileset, 
                this.entitySpecs.sprite.x , this.entitySpecs.sprite.y, 
                this.entitySpecs.sprite.w , this.entitySpecs.sprite.h,
                (x*this.gameRef.tileW) * this.scale,(y*this.gameRef.tileH) * this.scale,
                this.gameRef.tileW * this.scale, this.gameRef.tileH * this.scale
                );
            /*
            let col = "#0000ff";
            ctx.beginPath();
            ctx.rect(
                (x*this.gameRef.tileW) * this.scale , (y*this.gameRef.tileH)* this.scale,
                this.gameRef.tileW* this.scale , this.gameRef.tileH* this.scale
            );
            ctx.fillStyle = col;
            ctx.fill();
            */
        }
    }

    changePosition(newX=0,newY=0){
        //"teleport" player to a position
        this.positionX = newX;
        this.positionY = newY;
    }

    changeHealth(hp){
        this.actualhp += hp;
        
        if(this.actualhp > this.maxHp){
            this.actualhp = this.maxHp;
        }
        console.log(this.name, " HP has changed to: ",this.actualhp);
        
        if(this.actualhp <= 0){
            console.log(this.name, " is dead.");
        }
    }

    pickupItem(){
        if(this.gameRef.gameMap.hasContentOnCoords(this.positionX,this.positionY)){
            let newitem = this.gameRef.gameMap.requestItemPickupAt(this.positionX,this.positionY);
            if(newitem === false){
                console.log("not item");
                return;
            }
            this.addItemToInventoty(newitem,1)
            console.log("picked up: ",newitem);
            return;
        }
        console.log("no item to pickup");
    }


    attack(){

    }

    get position(){
        return [this.positionX,this.positionY];
    }

    get health(){
        return [this.currentHp,this.maxHp]
    }

    get readDescription(){
        if(this.description !== undefined){
            return this.description;
        }
    }
    getName(){
        return this.name;
    }

    setName(newName){
        console.log("name changed from: ",this.name," to: ",newName);
        this.name = newName;
    }

    set maxHealth(hp){
        this.maxHp = hp;
    }

    set description(text){
        this.description = text;
    }
}

class Character extends Entity{
    constructor(name="Character",x,y,maxhp,currentHp,damage=0,attackSpeed=0,entityType,game,globalID,stance){
        super(name,x,y,maxhp,currentHp,entityType,game,globalID);
        this.damage = damage;
        this.attackSpeed = attackSpeed;

        this.inventory = [];

        this.stance = stance; //relation between this entity and player. 0 = enemy , 1 = ally
    }
    init(){

    }
    
    addItemToInventoty(item,ammount){
        let newitem = {
            id:undefined,
            ammount:undefined,
        };
        let emptySlot = undefined;
        newitem.id = item;
        newitem.ammount = ammount;
        if(this.inventory.length === 0){
            console.log("inventory is empty, just add");
            this.inventory[0] = newitem;
        }else{
            console.log("inventoty is not empty, check");
            for(let i = 0;i < this.inventory.length;i++){
                if(this.inventory[i] === undefined){
                    console.log("current slot is open, update");
                    emptySlot = i;
                }
                if(this.inventory[i].id === newitem.id){
                    console.log("duped item, ammount increased");
                    this.inventory[i].ammount += newitem.ammount;
                    return "ok";
                }
            }
            if(emptySlot === undefined){
                //if no free slots have been found, open a new one
                console.log("current slots are different item type, cant stack, make new");
                this.inventory[ this.inventory.length ] = newitem;
            }else{
                console.log("previously used slot is free, add item");
                this.inventory[ emptySlot ] = newitem;
            }
        }
        console.log("inventory: ",this.inventory);
    }

    move(positionX = 0,positionY = 0){
        let newCoords = this.calculateMovingCoords(positionX,positionY);
        if(newCoords === false){
            return;
        }
        this.changePosition ( newCoords[0],newCoords[1] );
    }

    calculateMovingCoords(positionX = 0,positionY = 0){ //TILE based movement
        //check if it can move to desired pos
        //check if colliding with enemy, call attack
        let newCoords = [this.positionX,this.positionY];
        
        //the if check is because the recieved data could be undefined, by not moving on some axis, then it stays the same
        if(positionX !== undefined){
            newCoords[0] = this.positionX + positionX;
        }
        if(positionY !== undefined){
            newCoords[1] = this.positionY + positionY;
        }

        if(this.gameRef.gameMap.isTileSolid(newCoords[0],newCoords[1])){
            console.log("tile is solid");
            return false;
        }
        let interactableObj;
        if(this.gameRef.hasEntityOnPos(newCoords[0],newCoords[1]) === true){
            console.log("interact");
            return false;
        }
        return newCoords;
    }
}
class Structure extends Entity{
    constructor(name="Character",x,y,maxhp,currentHp,entityType,game,globalID){
        super(name,x,y,maxhp,currentHp,entityType,game,globalID);
        
        this.locked = false;
    }

    action(){ //how this element reacts when interacted with
        if(this.locked){

        }
    }
}

class Player extends Character {
    constructor(name,x,y,maxhp,currentHp,damage=0,attackSpeed=0,entityType,game,globalID){
        super(name,x,y,maxhp,currentHp,damage,attackSpeed,entityType,game,globalID);
        
    }

    init(){
        window.addEventListener("keyup", event => this.getKey(event) );
        this.positionX = this.gameRef.gameMap.playerSpawnPoint[0];
        this.positionY = this.gameRef.gameMap.playerSpawnPoint[1];
    }

    getKey(event){
        if(event.code === "KeyW"){
            this.move(0,-1);
            
        }else if(event.code === "KeyS"){
            this.move(0,1);
        }

        if(event.code === "KeyD"){
            this.move(1);
            
        }else if(event.code === "KeyA"){
            this.move(-1);
            
        }

        if(event.code === "KeyE"){
            this.pickupItem();
        }
        if(event.code === "KeyI"){
            console.log("open inventory");
            this.gameRef.inventoryOpen = !this.gameRef.inventoryOpen;
        }
    }

    interact(targetX,targetY){        
        console.log("interact: ",targetX,targetY);

    }
}

class Game {
    //all interactables must be of type entity, NPCs, Items and structures like doors or stairs
    //these should be stored on the same database, separated from actual structures like ground or walls
    //structures should not have the interactable tag, only entities
    //-----
    //all the lists should be created outside the class, and imported.
    //listById should not be created manually, instead generate dynamically based on each list
    constructor(tileW,tileH,scale=1,mapW,mapH,canvasName){
        this.tileSetURL;
        this.tileset = new Image();
        //saves the gameMap Object
        this.gameMap;
        //this.mapToTile = this.gameMap.mapToTile();
        
        this.player;

        this.entitiesIndex = new Map(); //this keeps a list of all the currently instantiated entities, enemies, allies, structures(interactables like doors) and the player | delete from index when instance is removed
        this.entityCount = 0;
        //size of tiles on PX
        this.tileW = tileW;
        this.tileH = tileH;
        //scale of the map
        this.scale = scale;
        //size of map on tiles
        this.mapW = mapW;
        this.mapH = mapH; //map height should not exceed screen height

        this.canvasName = canvasName;
        this.gameCanvas;

        this.canvasW;
        this.canvasH;
        this.ctx;

        this.inventoryOpen = false;
        //these two should be the same
        this.entitiesList = {
            //all Mob type entities should appear in mayus
            "player":{
                id: 0,
                sprite:{"x":480,"y":16,"w":"16","h":"16"},
                type:"character",
                color:"blue"
            },
            "goblin":{
                id: 1,
                sprite:{"x":400,"y":32,"w":"16","h":"16"},
                type:"character",
                color:"green"
            },
            "wizard":{
                id: 2,
                sprite:{"x":385,"y":16,"w":"16","h":"16"},
                type:"character",
                color:"purple"
            },
            "necromancer":{
                id: 3,
                sprite:{"x":496,"y":16,"w":"16","h":"16"},
                type:"character",
                color:"brown"
            },
            "skeleton":{
                id: 4,
                sprite:{"x":464,"y":96,"w":"16","h":"16"},
                type:"character",
                color:"brown"
            },
            "potion":{
                id: 5,
                sprite:{"x":528,"y":208,"w":"16","h":"16"},
                color:"red",
                type:"item",
                subtype:"consumible"
            },
            "sword":{
                id: 6,
                sprite:{"x":560,"y":112,"w":"16","h":"16"},
                color:"gray",
                type:"item",
                subtype:"weapon"
            },
            "chestPlate":{
                id: 7,
                sprite:{"x":512,"y":16,"w":"16","h":"16"},
                color:"orange",
                type:"item",
                subtype:"armor"
            },
            "key":{
                id: 8,
                sprite:{"x":544,"y":176,"w":"16","h":"16"},
                color:"orange",
                type:"item",
                subtype:"quest",
            },
            "door":{
                id: 9,
                sprite:{"x":160,"y":144,"w":"16","h":"16"},
                solid: true,
                type:"struct",
                subtype:"door",
            },
            "stair":{
                id: 10,
                sprite:{"x":160,"y":144,"w":"16","h":"16"},
                solid: false,
                type:"struct",
                subtype:"transition",//for level transition, portals, trapdoors, stairs, holes, etc
            },
            "chest":{
                id: 10,
                sprite:{"x":160,"y":144,"w":"16","h":"16"},
                solid: true,
                type:"struct",
                subtype:"container",
            },
            "bookshelf":{
                id: 10,
                sprite:{"x":160,"y":144,"w":"16","h":"16"},
                solid: true,
                type:"struct",
                subtype:"misc", //decorations or interactables (levers, buttons, etc)
                description:"books neatly ordered on a bookshelf",
            },
        };        
        this.entitiesListById = {
            //all Mob type entities should appear in mayus
            0: this.entitiesList.player,
            1:this.entitiesList.goblin,
            2:this.entitiesList.wizard,
            3:this.entitiesList.necromancer,
            4:this.entitiesList.skeleton,
            5:this.entitiesList.potion,
            6:this.entitiesList.sword,
            7:this.entitiesList.chestPlate,
            8:this.entitiesList.key,
            9:this.entitiesList.door,
            10:this.entitiesList.stair,
        };

        this.init();
    }

    async setMap(){
        return new Promise((resolve) => {
            resolve( new GameMap(this.tileW,this.tileH,this.scale,this.mapW,this.mapH,this) );
        });
    }
    async init(){
        //Initialize variables or methods
        this.gameCanvas = document.getElementById(this.canvasName);
        
        this.tileset.src = "./colored-transparent_packed.png";
        if(this.gameCanvas === undefined) { 
            console.error("canvas not found"); 
            return;
        }
        
        
        this.ctx = this.gameCanvas.getContext("2d");
        this.ctx.scale(this.scale,this.scale);
        
        
        this.gameMap = await this.setMap()
        
        let isMapfinish = await this.gameMap.init();
        let canvasSize = this.gameMap.canvasSize;
        
        this.canvasW = canvasSize[0];
        this.canvasH = canvasSize[1];
        this.gameCanvas.width = canvasSize[0];
        this.gameCanvas.height = canvasSize[1];
        
        this.player = new Player("player",5,5,100,100,undefined,undefined,this.entitiesList.player,this,this.entityCount);
        this.addNewEntity(this.player);
        
        this.ctx.imageSmoothingEnabled = false; //if this is set before resizing, pixels get blurry
        this.draw();
        
    }

    update(){
        //Update important data / behaviour
    }

    draw(){
        //Draw graphics on canvas
        this.ctx.clearRect(0,0, this.gameCanvas.width, this.gameCanvas.height);
        let currentSecond = 0, frameCount = 0, framesLastSecond = 0, lastFrameTime = 0;
        for(let y= 0; y < this.mapH; y++){
            for(let x = 0; x < this.mapW; x++){
                
                this.gameMap.draw(this.ctx,x,y);
                this.entitiesIndex.forEach(entity => {
                    entity.draw(this.ctx,x,y);
                });
            }
        }
        if(this.inventoryOpen){

            let invSlots = 20;
            let invSlotSize = 48; //px
            let innerPadding = 6; //px
            let padding = 5;//px

            let originX=0;
            let originY=0;

            let endX = originX + padding*2 ;
            let endY = originY + padding*2 ;

            let maxSlotWidth = originX +invSlotSize + padding*2 + innerPadding;
            let count = 1;
            let width = (this.canvasW * 30) / 100;
            let height = (this.canvasH * 60) / 100;
            
            //inventory bg
            let col = this.ctx.createLinearGradient(0, 0, width, 0);
            col.addColorStop(0, "#2d1818");
            col.addColorStop(0.2, "#4d3131");
            col.addColorStop(0.5, "#5b4848");
            col.addColorStop(0.7, "#4d3131");
            col.addColorStop(1, "#2d1818");
            
            this.ctx.beginPath();
            this.ctx.rect(originX,originY,width,height);
            this.ctx.fillStyle = col;
            this.ctx.fill();
            this.ctx.lineWidth = padding;
            this.ctx.stroke();

            for(let i=0; i<invSlots; i++){
                this.ctx.beginPath();
                this.ctx.rect(endX,endY,invSlotSize+innerPadding,invSlotSize+innerPadding);
                this.ctx.lineWidth = padding;
                this.ctx.stroke();

                
                
                if(this.player.inventory[i]){
                    let itemspr = this.entitiesListById[ this.player.inventory[i].id ];
                    //console.log(itemspr);
                    this.ctx.drawImage(this.tileset, 
                        itemspr.sprite.x , itemspr.sprite.y, 
                        itemspr.sprite.w , itemspr.sprite.h,
                        endX + (innerPadding /2) , endY + (innerPadding /2),
                        invSlotSize ,invSlotSize
                    );
                    let font = invSlotSize/2 + "px Arial";
                    this.ctx.font = font;
                    this.ctx.fillStyle = "white";
                    this.ctx.fillText(
                        this.player.inventory[i].ammount, 
                        (endX + invSlotSize + innerPadding ) - this.ctx.measureText("1").width,
                        (endY + invSlotSize )
                    );
                    
                    
                }

                if( Math.floor(width / maxSlotWidth) <= count){
                    endX = originX + padding * 2 ;
                    endY = endY + invSlotSize + (padding*2) +innerPadding;
                    count = 1;
                }else{
                    count++;
                    endX = endX + invSlotSize + (padding*2) + innerPadding;
                }
                
            }

        }
        requestAnimationFrame(() => this.draw());
    }

    fetchProject(){
        //get the data needed to start the game
    }
    addNewEntity(entity){
        this.entitiesIndex.set(this.entityCount,entity);
        this.entityCount ++;
    }
    
    removeEntity(entityID){
        this.entitiesIndex.delete(entityID);
    }
    hasEntityOnPos(coordX,coordY){
        let tileNumber = this.gameMap.mapToTile(coordX,coordY);
        let entityTile;
        let res = false;
        
        for(let entity of this.entitiesIndex.entries()){
            entityTile = this.gameMap.mapToTile(entity[1].positionX,entity[1].positionY);
            if(tileNumber === entityTile){
                return true;
            }
        }
        return false;
    }

}

class Bag{
    constructor(name,bagSize){
        //the name of this bag
        this.name = name;
        //
        this.bagSize = bagSize;
        //save the items here
        this.slots = [];
        //quick search for items. usefull for finding multiple stacks of the same item.
        this.dictionary = new Map();
    }

    update(){

    }
    expandBag(){

    }
    reduceBag(){

    }
    addItem(){

    }
    removeItem(){

    }
}
class Inventory extends Bag{
    constructor(name,bagSize){
        super(name,bagSize);
        
        //a structure to store the equiped armor, weapons and ammunition
        //this should be paired with a key(the slot, head, torso, left hand etc.) and the value being the actual equipment
        this.equipment = new Map();
    }

    draw(){
        
    }
}