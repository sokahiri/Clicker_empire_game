
class userData{
    static sellingPriceCofficient=0.6;
    constructor(name,age,itemsList){
        this.name=name;
        this.day=0;
        this.age=age;
        this.cash=50000;
        this.assetsTotal=this.cash;
        this.burgers=0;
        this.burgerValue=25;
        this.dailyIncome=0;
        //株以外の商品をまとめる
        this.goodsList={};
        //株をまとめる
        this.stockList={};
        //株とそれ以外の商品を仕分けする
        for(let i=0;i<itemsList.length;i++){
            if(itemsList[i].type==="ability"||itemsList[i].type==="realEstate"){
                this.goodsList[itemsList[i].name]=0;
            }else if(itemsList[i].type==="stock"){
                this.stockList[itemsList[i].name]=0;
            }
        }
    }
    updateCash(money){
        this.cash+=money;
        this.assetsTotal+=money;
    }
    updateAssetsTotal(money){
        this.assetsTotal+=money;
    }
    updateAge(){
        if(this.day%365===0){
            this.age++
        }
    }
    getMaxBuy(item){
        if(item.type==="stock"){
            return Math.floor(this.cash/item.cost);
        }
        return(Math.min(item.maxCanHas-this.goodsList[item.name],Math.floor(this.cash/item.cost)));
    }
    getMaxSell(item){
        return(item.type==="stock"?this.stockList[item.name]:this.goodsList[item.name]);
    }
    buyItem(item,quantity){
        if(quantity>this.getMaxBuy(item)){
            alert("現金が足りません");
            return;
        }
        this.updateCash(-item.cost*quantity);
        if(item.type==="stock"){
            this.updateAssetsTotal(item.cost*quantity);
            this.stockList[item.name]+=quantity;
        }else{
            this.updateAssetsTotal(Math.floor(item.cost*userData.sellingPriceCofficient)*quantity);
            this.goodsList[item.name]+=quantity;
            if(item.type==="ability"){
                this.burgerValue+=item.profit*quantity;
            }else{
                this.dailyIncome+=item.profit*quantity;
            }
        }
    }
    sellItem(item,quantity){
        if(item.type==="stock"){
            if(quantity>this.stockList[item.name]){
                alert("所持数が足りません");
                return;
            }
            this.stockList[item.name]-=quantity;
            this.updateCash(item.cost*quantity);
            this.updateAssetsTotal(-item.cost*quantity);
        }else{
            if(quantity>this.goodsList[item.name]){
                alert("所持数が足りません");
                return;
            }
            this.goodsList[item.name]-=quantity;
            this.updateCash(Math.floor(item.cost*userData.sellingPriceCofficient)*quantity);
            this.updateAssetsTotal(-Math.floor(item.cost*userData.sellingPriceCofficient)*quantity);
            if(item.type==="ability"){
                this.burgerValue-=item.profit*quantity;
            }else{
                this.dailyIncome-=item.profit*quantity;
            }
        }
    }
    saveLocalStrage(){
        localStorage.setItem("name",this.name);
        localStorage.setItem("day",this.day.toString());
        localStorage.setItem("age",this.age.toString());
        localStorage.setItem("cash",this.cash.toString());
        localStorage.setItem("assetsTotal",this.assetsTotal.toString());
        localStorage.setItem("burgers",this.burgers.toString());
        localStorage.setItem("burgerValue",this.burgerValue.toString());
        localStorage.setItem("dailyIncome",this.dailyIncome.toString());
        let goodsListKey=Object.keys(this.goodsList);
        let stockListKey=Object.keys(this.stockList);
        for(let i=0;i<goodsListKey.length;i++){
            localStorage.setItem(goodsListKey[i],this.goodsList[goodsListKey[i]]);
        }
        for(let i=0;i<stockListKey.length;i++){
            localStorage.setItem(stockListKey[i],this.stockList[stockListKey[i]]);
        }
    }
    loadLocalStrage(){
        this.name=localStorage.getItem("name");
        this.day=parseInt(localStorage.getItem("day"));
        this.age=parseInt(localStorage.getItem("age"));
        this.cash=parseInt(localStorage.getItem("cash"));
        this.assetsTotal=parseInt(localStorage.getItem("assetsTotal"));
        this.burgers=parseInt(localStorage.getItem("burgers"));
        this.burgerValue=parseInt(localStorage.getItem("burgerValue"));
        this.dailyIncome=parseInt(localStorage.getItem("dailyIncome"));
        let goodsListKey=Object.keys(this.goodsList);
        let stockListKey=Object.keys(this.stockList);
        for(let i=0;i<goodsListKey.length;i++){
            this.goodsList[goodsListKey[i]]=localStorage.getItem(goodsListKey[i]);
        }
        for(let i=0;i<stockListKey.length;i++){
            this.stockList[stockListKey[i]]=localStorage.getItem(stockListKey[i]);
        }
    }

}
const timeConfig={
    scale:1,
    updateDataID:undefined
}
//商品の種類のclassをまとめるオブジェクト
const items={
    ability:class{
        type="ability";
        constructor(name,url,cost,profit,maxCanHas){
            this.name=name;
            this.url=url;
            this.cost=cost;
            this.profit=profit;
            this.maxCanHas=maxCanHas;
        }
        getProfitLabel(){
            return getMoneyLabel(this.profit)+"/click"
        }
    },
    realEstate:class{
        type="realEstate"
        constructor(name,url,cost,profit,maxCanHas){
            this.name=name;
            this.url=url;
            this.cost=cost;
            this.profit=profit;
            this.maxCanHas=maxCanHas;
        }
        getProfitLabel(){
            return getMoneyLabel(this.profit)+"/day"
        }
    },
    stock:class{
        type="stock";
        constructor(name,url,cicleBace,amplitude,cicleBand,constant,cicleRandomCoefficient,cicleRandomCicle,randomCoefficient){
            this.name=name;
            this.url=url;
            this.cicleBace=cicleBace; //周期
            this.amplitude=amplitude; //振幅
            this.cicleBand=cicleBand; //周期変動幅係数
            this.constant=constant; //定数
            this.cicleRandomCoefficient=cicleRandomCoefficient; //周期的ランダム項係数
            this.cicleRandomCicle=cicleRandomCicle; //周期的ランダム項周期
            this.randomCoefficient=randomCoefficient; //ランダム係数
            this.cost=constant;
            this.cicleRandom=0;
            this.cicle=cicleBace;
            this.isFailed=false;
            this.resetDay=0;
        }
        dailyCostUpdate(currentUserData){
            let day=currentUserData.day;
            let nowHas=currentUserData.stockList[this.name];
            currentUserData.updateAssetsTotal(-this.cost*nowHas);
            if(this.isFailed===false){
                if(day%this.cicle===0)this.cicle=this.cicleBace*randomNum(1-this.cicleBand,1+this.cicleBand);
                if(day%this.cicleRandomCicle===0)this.cicleRandom+=this.cicleRandomCoefficient*this.amplitude*randomNum(-1,1);
                let theta=(day%this.cicle)/this.cicle*2*Math.PI;
                this.cost=Math.round(this.constant+this.amplitude*Math.sin(theta)+this.cicleRandom+this.randomCoefficient*randomNum(-1,1)*this.amplitude);
                if(this.cost>=0){
                    currentUserData.updateAssetsTotal(this.cost*nowHas);
                    return this.cost;
                }else{
                    this.cost=0;
                    currentUserData.stockList[this.name]=0;
                    toggleBlockNone(document.querySelector(`#${this.name}-canvas`),document.querySelector(`#${this.name}-isFailed`));
                    if(document.querySelector(".stock")!==null){
                        toggleBlockNone(document.querySelector("#stock-canvas"),document.querySelector("#isFailed"));
                    }
                    this.isFailed=true;
                    this.resetDay=day+10;
                    console.log("failed");
                    return 0;
                }
            }else if(this.isFailed===true){
                this.failed(currentUserData)
                return 0;
            }
            
        }
        failed(currentUserData){
            if(currentUserData.day===this.resetDay){
                this.cicleRandom=0;
                this.isFailed=false;
                canvasAction.resetData(charts[this.name],this,currentUserData);
                toggleBlockNone(document.querySelector(`#${this.name}-isFailed`),document.querySelector(`#${this.name}-canvas`));
                if(document.querySelector(".stock")!==null){
                    toggleBlockNone(document.querySelector("#isFailed"),document.querySelector("#stock-canvas"));
                }
                return;
            }
            return;
        }
        resetData(){
            this.cicle=this.cicleBace;
            this.cost=0;
            this.isFailed=false;
            this.cicleRandom=0;
        }
    }
};
//実際のアイテムリスト
const itemsList=[
    new items.ability("Flip Machine","https://1.bp.blogspot.com/-Bw5ZckDs9X8/XdttVGl2K5I/AAAAAAABWG4/ySICN6pGG68DXOA3iGg6OehjhfY4UYzwACNcBGAsYHQ/s1600/cooking_camp_bbq_grill.png",15000,25,500),
    new items.stock("StockA","https://owl-stock.work/wp-content/uploads/2021/04/01141-tmb.png",75,3000,0.2,9000,0.4,10,0.5),//0.5,0.5
    new items.stock("StockB","https://owl-stock.work/wp-content/uploads/2021/04/01141-tmb.png",300,10000,0.2,15000,0.05,10,0.3),
    new items.stock("StockC","https://owl-stock.work/wp-content/uploads/2021/04/01141-tmb.png",20,1500,0.5,6000,1,5,0.9),
    new items.realEstate("Lemonade Stand","https://1.bp.blogspot.com/-tzP9gGYpFP8/XVjgHkZ40UI/AAAAAAABUMU/zQeTzUi4MjMRSXxZBI3cOqDYXwiAQhe1wCLcBGAs/s400/drink_lemonade.png",30000,30,1000),
    new items.realEstate("Ice Cream Truck","https://4.bp.blogspot.com/-4jisCuglRcI/VYJcha81hUI/AAAAAAAAuZ8/CLPLKpVnDTY/s400/sweets_icecream_3dan.png",100000,120,500),
    new items.realEstate("House","https://4.bp.blogspot.com/-HJswnQNpI2A/UZmB9YzilXI/AAAAAAAATYY/DPn1NBHu7pA/s400/house_1f.png",20000000,32000,100),
    new items.realEstate("TownHouse","https://1.bp.blogspot.com/-0L0XttO6MCg/UZmB9c_SsKI/AAAAAAAATYc/Vk-8_vEkUew/s400/house_2f.png",40000000,64000,100),
    new items.realEstate("Mansion","https://2.bp.blogspot.com/-mcBTpFJvFNo/WeAFbqrzyHI/AAAAAAABHjQ/5cGZy_hvgtwumLbyggYibhxmj7lunDhwACLcBGAs/s400/building_mansion2.png",250000000,500000,20),
    new items.realEstate("Industrial Space","https://4.bp.blogspot.com/-X6Y32Uh5ud4/W_UF70_iobI/AAAAAAABQT0/gF3Braf7peIkKgr_MWRSRz_RuCR4wMnsACLcBGAs/s400/building_koujou_entotsu.png",1000000000,2200000,10),
    new items.realEstate("Hotel Skyscraper","https://3.bp.blogspot.com/-qbqb7xIicEA/VpjCnDpHkfI/AAAAAAAA3EE/8NqVEr8MMxQ/s400/kousou_hotel.png",10000000000,25000000,5),
    new items.realEstate("Bullet-Speed Sky Railway","https://4.bp.blogspot.com/-xeElVHnaO6E/UUhH-h33LkI/AAAAAAAAO6s/ZdByhm_3NRI/s400/train_shinkansen.png",10000000000000,30000000000,1)
];
//株のグラフ描画のための設定
class chartConfig{
    type= 'line';
    data= {
        labels: Array.from({length:50 },()=>""),
        datasets: [{
            label: 'My First dataset',
            backgroundColor: 'rgb(231, 191, 9)',
            borderColor: 'rgb(231, 191, 9)',
            color:'rgb(255, 255, 255)',
            data: Array.from({length:50 },()=>null),//null
        }]
    };
    options= {
        animation:false,
        responsive:true,
        maintainAspectRatio: false,
        plugins:{
            legend:{
                display:false
            },
        },
        scales: {
            y: {
                display:true,
                stacked: true,
                grid: {
                    display: true,
                    color: "rgba(255,255,255,0.4)"
                }
              },
            x: {
                display:false,
                grid: {
                    display: false
                }
            }
        }
    };
}
let canvasAction={
    updateCanvas(chart,stock,currentUserData) {
        
        chart.data.datasets.forEach(dataset => {
            if(dataset.data.length>=50)this.removeData(chart);
            this.addData(chart,stock,currentUserData);
        })
        chart.update();
    },
    addData(chart,stock,currentUserData){
        const data = chart.data;
        
        if (data.datasets.length > 0) {
            for (let index = 0; index < data.datasets.length; ++index) {
                data.datasets[index].data.push(stock.dailyCostUpdate(currentUserData));
            }
            chart.update();
        }
    },
    removeData(chart){
        chart.data.datasets.forEach(dataset=>{
            dataset.data.shift();
        });
    },
    resetData(chart,stock,currentUserData){
        chart.data.datasets.forEach(dataset => {
            dataset.data=Array.from({length:50 },()=>null)
            this.updateCanvas(chart,stock,currentUserData);
        })
        
    }
}

let charts={};
let discriptionChart;

//各ページのDOM要素を返す関数をまとめるオブジェクト
const getTemplateDiv={
    formPage(){
        let container=document.createElement("div");
        container.classList.add("row","justify-content-center","col-12","m-0","p-0")
        container.innerHTML=`
                <!--スマホ画面用のimg-->
                <img src="https://cdn.pixabay.com/photo/2016/11/13/12/52/kuala-lumpur-1820944_960_720.jpg" class="form-img col-12">
                <!--メインブロック-->
                <form id="form" class="bg-white form">
                    <!--フォームをまとめる-->
                    <div class="row justify-content-center col-12 col-md-6 title-color mx-md-3">
                        <h2 class="text-center p-2 col-12 p-md-4">Clicker Empire Game</h2>
                        <!--名前記入用フォームの位置を整えている-->
                        <div class="form-imput text-center col-10">
                            <input type="text" placeholder="Your Name" name="name" required class="col-12">
                        </div>
                        <!--年齢記入用フォームの位置を整えている-->
                        <div class="pt-1 pb-2 form-imput text-center col-10 pb-md-4 pt-md-2">
                            <input type="number" placeholder="age" name="age" required class="col-12">
                        </div>
                        <!--ボタンをまとめる-->
                        <div class="d-flex justify-content-between col-10 pb-4">
                            <button type="button" name="new" class="btn btn-primary col-5" onclick="gameStart(); event.preventDefault();">New</button>
                            <button type="button" id="login" class="btn btn-outline-primary col-5 bg-white">Login</button>
                        </div>
                    </div>
                </form>
        `;
        let login=container.querySelector("#login");
        login.addEventListener("click",function(){
            if(document.getElementsByName("name")[0].value===localStorage.getItem("name")){
                const currentUserData=new userData("n",0,itemsList)
                currentUserData.loadLocalStrage();
                changeMainPage(page.form,currentUserData);
                createGraph(itemsList);
                timeConfig.updateDataID= setInterval(function(){
                    updateData(currentUserData,itemsList);
                },Math.floor(1000/timeConfig.scale));
            }else{
                alert("名前が一致するセーブデータがありません");
            }
        });
        return container;
    },
    mainPage(userData,itemsList){
        const action={
            updateCash(money){
                userData.updateCash(money);
                container.querySelector("#cashLabel").innerHTML= getMoneyLabel(userData.cash);
                container.querySelector("#assetsTotalLabel").innerHTML=getMoneyLabel(userData.assetsTotal);
            },
            updateAssetsTotal(money){
                userData.updateAssetsTotal(money);
                container.querySelector("#assetsTotalLabel").innerHTML=getMoneyLabel(userData.assetsTotal);
            },

        }
        let container=document.createElement("div");
        container.classList.add("background", "d-flex","flex-column", "flex-md-row","justify-content-center","m-0" ,"align-items-center","align-items-md-start");
        container.innerHTML=`
        <div class="col-md-4 flex-md-column col-12 row justify-content-md-between justify-content-center m-0 align-items-end align-items-md-start">
            <!--左側-->
            <div class="col-5 col-md-12 mini-border mt-3">
                <div class="row justify-content-center my-2 text-end">
                    <h4><span id="burgersLabel">${userData.burgers}</span> Burgers</h4>
                    <h4><span id="burgerValue">${getMoneyLabel(userData.burgerValue)}</span> /Burger</h4>
                </div>
                <div class="row justify-content-center">

                    <button id="burger-button" class="bg-transparent" style="width: auto;"><img src="https://2.bp.blogspot.com/-63vQtYUKJBY/UgSMCmG66LI/AAAAAAAAW6w/-VMth7DVjcY/s400/food_hamburger.png" class="" style="max-height: 20vh; width: auto;"></button>  
                    <h2 class="text-center">CLICK BURGER</h2>
                </div>
            </div>
            <div class="mt-5 py-1 col-5 col-md-12">
                <h4>Name: <span id="name">${userData.name}</span></h4>
                <h4>Age: <span id="age">${userData.age}</span> years old</h4>
                <h4>Day: <span id="day">${userData.day}</span> days</h4>
            </div>
        </div>
        <div class="col-md-8 col-10 d-flex flex-column justify-content-md-between align-items-center">
            <!--右側-->
            <div class="col-12 row flex-column m-0 justify-content-center right-panel" >
                <h5 class="m-1"><span class="font-gold"><i class="fas fa-money-bill"></i> Cash: </span><span id="cashLabel">${getMoneyLabel(userData.cash)}</span></h5>
                <h5 class="m-1"><span class="font-gold"><i class="fas fa-building"></i> Asset: </span><span id="assetsTotalLabel">${getMoneyLabel(userData.assetsTotal)}</span></h5>
            </div>
            <div id="container" class="col-12 y-scrollable mini-border right-panel" style="height: 80vh;"></div>
            <div class="col-12 d-flex justify-content-between align-items-center" style="height: 70px;">
                <div class="">
                    <button class="bg-transparent mx-2" id="time-scale" data-timeScale="${timeConfig.scale}"><i class="fas fa-forward fa-fluid"></i></button>
                    <span class="fw-bold fa-fluid" id="time-scale-label">× 1</span>
                </div>
                <div class="">
                    <button class="bg-transparent" id="save"><i class="far fa-save fa-fluid"></i></button>
                    
                    <button class="bg-transparent mx-2" id="exit"><i class="fas fa-sign-out-alt fa-fluid"></i></button>
                </div>
            </div>
        </div>
        `;
        //ハンバーガーをクリックしたときの挙動
        let burgerButton= container.querySelector("#burger-button");
        burgerButton.addEventListener("click",function(){
            //burgersの更新
            userData.burgers+=1;
            container.querySelector("#burgersLabel").innerHTML=userData.burgers;
            //cashとassetsTotalの更新
            action.updateCash(userData.burgerValue);
        })
        //itemcontainer,itemdiscriptionが入る場所
        let itemArea=container.querySelector("#container");
        //itemTabの集合が入る場所
        let itemContainer=document.createElement("div");
        itemArea.append(itemContainer);       
        itemContainer.classList.add("item-container");
        for(let i=0;i<itemsList.length;i++){
            if(itemsList[i].type==="ability"||itemsList[i].type==="realEstate"){
                itemContainer.append(this.parts.goodsTab(itemsList[i],userData));
            }else if(itemsList[i].type==="stock"){
                itemContainer.append(this.parts.stockTab(itemsList[i],userData));
            }
        }
        //1倍速～5倍速まで変更できるスイッチ
        let timeScale=container.querySelector("#time-scale");
        timeScale.addEventListener("click",function(){
            clearInterval(timeConfig.updateDataID);
            timeConfig.scale=loopInt(1,5,parseInt(timeScale.getAttribute("data-timeScale")))
            timeConfig.updateDataID=setInterval(function(){
                updateData(userData,itemsList);
            },1000/timeConfig.scale)
            container.querySelector("#time-scale-label").innerHTML=`× ${timeConfig.scale}`
            timeScale.setAttribute("data-timeScale",`${timeConfig.scale}`)
        });
        //進行状況をセーブするスイッチ
        container.querySelector("#save").addEventListener("click",function(){
            userData.saveLocalStrage();
        });
        container.querySelector("#exit").addEventListener("click",function(){
            clearInterval(timeConfig.updateDataID);
            changeFormPage(page.main);
        });
        return container;

        function loopInt(min,max,int){
            return (max===int?min:int+1)
        }
    },
    
    parts:{
        goodsTab(goods,currentUserData){
            let container=document.createElement("div");
            container.classList.add("item-tab","row","justify-content-center","m-2");
            container.innerHTML=`
            <div class="col-4 height-fix d-flex justify-content-center align-items-center p-0 ">
                <img class="col-12 item-img" src=${goods.url}>
            </div>
            <div class="col-7 height-fix row flex-column flex-nowrap justify-content-center align-items-center m-0 p-0 text-center">
                <h5 class="m-0">${goods.name}</h5>
                <div class="m-0"><span id="${removeSpace(goods.name)}-nowHas">${currentUserData.goodsList[goods.name]}</span> has</div>
                <div class="m-0 font-gold">${goods.getProfitLabel()}</div>
                <div class="fw-bold px-1 m-0">${getMoneyLabel(goods.cost)}</div>
            </div>
            `;
            //タブを押したときdiscriptionページへ進む
            container.addEventListener("click",function(){
                page.main.querySelector("#container").append(getTemplateDiv.parts.goodsDiscription(goods,currentUserData));
                toggleBlockNone(page.main.querySelector(".item-container"),page.main.querySelector(".discription-container"));
            });
            return container;
        },
        stockTab(stock,currentUserData){
            let container=document.createElement("div");
            container.classList.add("item-tab","row","justify-content-center","m-2");
            container.innerHTML=`
                <div class="col-3 height-fix d-flex justify-content-center align-items-center p-0 d-lg-block d-none">
                    <img class="col-12 item-img d-lg-block d-none" src=${stock.url}>
                </div>
                <div class="col-4 col-lg-3 height-fix row flex-column justify-content-center text-center m-0">
                    <h5 class="col-12 m-0">${stock.name}</h5>
                    <div class="col-12"><span id="${stock.name}-nowHas">${currentUserData.stockList[stock.name]}</span> has</div>
                    <div class="fw-bold col-12" id="${stock.name}-cost">${getMoneyLabel(stock.cost)}</div>
                </div>
                <div class="col-8 col-lg-6 height-fix row m-0 justify-content-center align-items-center stock-canvas-div itemTab-stock-canvas-div">
                    <canvas id="${stock.name}-canvas" class="stock-canvas d-block"></canvas>
                    <h1 class="text-center d-none isFailed" id="${stock.name}-isFailed">is Failed...</h1>
                </div>
            `;
            
            //タブを押したときdiscriptionページへ進む
            container.addEventListener("click",function(){
                page.main.querySelector("#container").append(getTemplateDiv.parts.stockDiscription(stock,currentUserData));
                createGraphDiscription(stock)
                toggleBlockNone(page.main.querySelector(".item-container"),page.main.querySelector(".discription-container"));
            });
            
            
            return container;
        },
        goodsDiscription(goods,currentUserData){
            let container=document.createElement("div");
            container.classList.add("discription-container","goods", "d-block")
            container.innerHTML=`
                <div class="row m-0 p-2">
                    <div class="col-7 row flex-column justify-content-center m-0 p-0">
                        <h1>${goods.name}</h1>
                        <div><span class="text-decoration-underline">Max Purchases:</span> ${goods.maxCanHas}</div>
                        <div><span class="text-decoration-underline">Now has:</span> <span id="nowHas">${currentUserData.goodsList[goods.name]}</span></div>
                        <div class="font-gold"><span class="text-decoration-underline">Get:</span> ${goods.getProfitLabel()}</div>
                        <div><span class="text-decoration-underline">Price:</span> ${getMoneyLabel(goods.cost)}</div>               
                    </div>
                    <div class="col-5">
                        <img class="col-12 item-img" src=${goods.url}>
                    </div>
                </div>
            `;
            container.append(this.discriptionLower(goods,currentUserData));
            //buyボタン、sellボタンの設定
            container.querySelector("#Buy1").addEventListener("click",function(){
                currentUserData.buyItem(goods,1);
                dataLabelUpdate.main(currentUserData);
                dataLabelUpdate.goodsDiscription(goods,currentUserData);


            });
            container.querySelector("#Buymax").addEventListener("click",function(){
                currentUserData.buyItem(goods,currentUserData.getMaxBuy(goods));
                dataLabelUpdate.main(currentUserData);
                dataLabelUpdate.goodsDiscription(goods,currentUserData);
            });
            container.querySelector("#Sell1").addEventListener("click",function(){
                currentUserData.sellItem(goods,1);
                dataLabelUpdate.main(currentUserData);
                dataLabelUpdate.goodsDiscription(goods,currentUserData);
            });
            container.querySelector("#Sellmax").addEventListener("click",function(){
                currentUserData.sellItem(goods,currentUserData.getMaxSell(goods));
                dataLabelUpdate.main(currentUserData);
                dataLabelUpdate.goodsDiscription(goods,currentUserData);
            });
            container.querySelector("#Buy-some").addEventListener("input",function(){
                container.querySelector("#Buy-total").innerHTML=getMoneyLabel(container.querySelector("#Buy-some").value*goods.cost);
            });
            container.querySelector("#Sell-some").addEventListener("input",function(){
                container.querySelector("#Sell-total").innerHTML=getMoneyLabel(container.querySelector("#Sell-some").value*Math.floor(goods.cost*userData.sellingPriceCofficient));
            });
            container.querySelector("#Buy-confirm").addEventListener("click",function(){
                if(container.querySelector("#Buy-some").value!==""){
                    currentUserData.buyItem(goods,parseInt(container.querySelector("#Buy-some").value));
                    container.querySelector("#Buy-some").value="";
                    dataLabelUpdate.main(currentUserData);
                    dataLabelUpdate.goodsDiscription(goods,currentUserData);
                    container.querySelector("#Buy-total").innerHTML=getMoneyLabel(0);
                }
            });
            container.querySelector("#Sell-confirm").addEventListener("click",function(){
                if(container.querySelector("#Sell-some").value!==""){
                    currentUserData.sellItem(goods,parseInt(container.querySelector("#Sell-some").value));
                    container.querySelector("#Sell-some").value="";
                    dataLabelUpdate.main(currentUserData);
                    dataLabelUpdate.goodsDiscription(goods,currentUserData);
                    container.querySelector("#Sell-total").innerHTML=getMoneyLabel(0);
                }
            });

            discriptionPage.update(goods,container);
            return container;
        },
        stockDiscription(stock,currentUserData){
            let container=document.createElement("div");
            container.classList.add("discription-container","stock", "d-block")
            container.innerHTML=`
                <div class="row m-2 p-0">
                    <div class="col-12 row justify-content-center align-items-center m-0 mb-2 text-center">
                        <h1 class="col-6">${stock.name}</h1>
                        <div class="col-6 text-end">
                            <div><span class="text-decoration-underline">Now has:</span> <span id="nowHas">${currentUserData.stockList[stock.name]}</span></div>
                            <div><span class="text-decoration-underline">Price:</span> <span id="stock-cost">${getMoneyLabel(stock.cost)}</span></div>
                        </div>
                        
                    </div>
                    <div class="col-12 d-flex justify-content-center align-items-center stock-canvas-div discription-stock-canvas-div">
                        <canvas class="stock-canvas d-block" id="stock-canvas"></canvas>
                        <h1 class="text-center d-none isFailed" id="isFailed">is Failed...</h1>
                    </div>
                </div>
            `;
            container.append(this.discriptionLower(stock,currentUserData));
            //buyボタン、sellボタンの設定
            container.querySelector("#Buy1").addEventListener("click",function(){
                currentUserData.buyItem(stock,1);
                dataLabelUpdate.main(currentUserData);
                dataLabelUpdate.stockDiscription(stock,currentUserData);
            });
            container.querySelector("#Buymax").addEventListener("click",function(){
                currentUserData.buyItem(stock,currentUserData.getMaxBuy(stock));
                dataLabelUpdate.main(currentUserData);
                dataLabelUpdate.stockDiscription(stock,currentUserData);
            });
            container.querySelector("#Sell1").addEventListener("click",function(){
                currentUserData.sellItem(stock,1);
                dataLabelUpdate.main(currentUserData);
                dataLabelUpdate.stockDiscription(stock,currentUserData);
            });
            container.querySelector("#Sellmax").addEventListener("click",function(){
                currentUserData.sellItem(stock,currentUserData.getMaxSell(stock));
                dataLabelUpdate.main(currentUserData);
                dataLabelUpdate.stockDiscription(stock,currentUserData);
            });
            container.querySelector("#Buy-some").addEventListener("input",function(){
                container.querySelector("#Buy-total").innerHTML=getMoneyLabel(container.querySelector("#Buy-some").value*stock.cost);
            });
            container.querySelector("#Sell-some").addEventListener("input",function(){
                container.querySelector("#Sell-total").innerHTML=getMoneyLabel(container.querySelector("#Sell-some").value*Math.floor(stock.cost*userData.sellingPriceCofficient));
            });
            container.querySelector("#Buy-confirm").addEventListener("click",function(){
                if(container.querySelector("#Buy-some").value!==""){
                    currentUserData.buyItem(stock,parseInt(container.querySelector("#Buy-some").value));
                    container.querySelector("#Buy-some").value="";
                    dataLabelUpdate.main(currentUserData);
                    dataLabelUpdate.stockDiscription(stock,currentUserData);
                    container.querySelector("#Buy-total").innerHTML=getMoneyLabel(0);
                }
            });
            container.querySelector("#Sell-confirm").addEventListener("click",function(){
                if(container.querySelector("#Sell-some").value!==""){
                    currentUserData.sellItem(stock,parseInt(container.querySelector("#Sell-some").value));
                    container.querySelector("#Sell-some").value="";
                    dataLabelUpdate.main(currentUserData);
                    dataLabelUpdate.stockDiscription(stock,currentUserData);
                    container.querySelector("#Sell-total").innerHTML=getMoneyLabel(0);
                }
            });

            discriptionPage.update(stock,container);
            return container;

        },
        discriptionLower(goods,currentUserData){
            let container=document.createElement("div");
            //Buy-Sellボタンを入れる
            container.innerHTML=`
                <div id="buy-sell-radio" class="text-center">
                    <input type="radio" id="buy-radio" name="buyOrSell" class="btn-check" autocomplete="off" checked>
                    <label class="btn buy-sell-radio" for="buy-radio"><h5>Buy</h5></label>

                    <input type="radio" id="sell-radio" name="buyOrSell" class="btn-check" autocomplete="off">
                    <label class="btn buy-sell-radio" for="sell-radio"><h5>Sell</h5></label>                       
                </div>
            `;
            container.append(lowerPart("Buy"),lowerPart("Sell"));
            let BuyPart=container.querySelector("#Buy-part");
            let SellPart=container.querySelector("#Sell-part");
            SellPart.classList.add("d-none");
            container.querySelector("#buy-radio").addEventListener("click",function(){
                toggleBlockNone(SellPart,BuyPart);
                BuyPart.querySelector("#Buy-max").innerHTML=currentUserData.getMaxBuy(goods);
            });
            container.querySelector("#sell-radio").addEventListener("click",function(){
                toggleBlockNone(BuyPart,SellPart);
                SellPart.querySelector("#Sell-max").innerHTML=currentUserData.getMaxSell(goods);
            }); 

            

            return container;

            //BuyかSellを引数に取り、対応した下半分要素を返す  それぞれの要素は#Buy-part,#Sell-partで得られる
            function lowerPart(buyOrSell){
                let container=document.createElement("div");
                container.id=buyOrSell+"-part"
                container.innerHTML=`
                <div class="row justify-content-center m-0 pt-3">
                    <div class="col-7 row justify-content-around m-0 p-0">
                        <button id="${buyOrSell}1" class="col-5 btn-outline-light bg-transparent buy-button m-0 p-0">${buyOrSell} 1</button>
                        <button id="${buyOrSell}max" class="col-5 btn-outline-light bg-transparent buy-button m-0 p-0">${buyOrSell} MAX</button>
                        <div class="text-end pt-1 pb-2">${buyOrSell} Max: <span id="${buyOrSell}-max">${currentUserData.getMaxBuy(goods)}</span></div>
                    </div>
                    <div class="col-5">
                        <input id="${buyOrSell}-some" type="number" class="col-12" placeholder="${buyOrSell} some" min="0" class="buy-some">
                        <div class="text-end pt-1 pb-2 total-cost">Total: <span id="${buyOrSell}-total">${getMoneyLabel(0)}</span></div>
                    </div>
                </div>
                
                <div class="row justify-content-between px-3 m-0">
                    <button class="btn btn-outline-primary col-5 go-back">Go Back</button>
                    <button id="${buyOrSell}-confirm" class="btn btn-primary col-5 confirm">Confirm</button>
                </div>
                `;
                //buy-sell共通の挙動
                container.querySelector(".go-back").addEventListener("click",function(){
                    backItemContainer();
                });

                return container;
            };
            //アイテムコンテナーの表示に戻る。  discription-containerノードを削除する
            function backItemContainer(){
                toggleBlockNone(page.main.querySelector(".discription-container"),page.main.querySelector(".item-container"));
                page.main.querySelector(".discription-container").remove();
            }
        },
        stockGraph(stockName){}
    }
};
const dataLabelUpdate={
    main(currentUserData){
        let main=page.main;
        main.querySelector("#cashLabel").innerHTML= getMoneyLabel(currentUserData.cash);
        main.querySelector("#assetsTotalLabel").innerHTML=getMoneyLabel(currentUserData.assetsTotal);
        main.querySelector("#age").innerHTML=currentUserData.age;
        main.querySelector("#day").innerHTML=currentUserData.day;
        main.querySelector("#burgerValue").innerHTML=getMoneyLabel(currentUserData.burgerValue);
    },
    itemContainer(currentUserData,itemsList){
        let main=page.main;
        main.querySelector(`#${itemsList[0].name.replace(" ","")}-nowHas`).innerHTML=currentUserData.goodsList[itemsList[0].name];
        for(let i=1;i<4;i++){
            main.querySelector(`#${itemsList[i].name}-cost`).innerHTML=getMoneyLabel(itemsList[i].cost);
            main.querySelector(`#${itemsList[i].name}-nowHas`).innerHTML=currentUserData.stockList[itemsList[i].name];
        }
        for(let i=4;i<itemsList.length;i++){
            main.querySelector(`#${removeSpace(itemsList[i].name)}-nowHas`).innerHTML=currentUserData.goodsList[itemsList[i].name];
        }

    },
    goodsDiscription(goods,currentUserData){
        document.querySelector("#Buy-max").innerHTML=currentUserData.getMaxBuy(goods);
        document.querySelector("#Sell-max").innerHTML=currentUserData.getMaxSell(goods);
        document.querySelector("#nowHas").innerHTML=currentUserData.goodsList[goods.name];
    },
    stockDiscription(stock,currentUserData){
        document.querySelector("#Buy-max").innerHTML=currentUserData.getMaxBuy(stock);
        document.querySelector("#Sell-max").innerHTML=currentUserData.getMaxSell(stock);
        document.querySelector("#nowHas").innerHTML=currentUserData.stockList[stock.name];
        document.querySelector("#stock-cost").innerHTML=getMoneyLabel(stock.cost);
    }
};

const discriptionPage={
    item:undefined,
    type:undefined,
    container:undefined,
    update(item){
        this.item=item;
        this.type=item.type;
    },
    updateLabel(currentUserData){
        if(this.type!=="stock"){
            dataLabelUpdate.goodsDiscription(this.item,currentUserData);
        }else{
            dataLabelUpdate.stockDiscription(this.item,currentUserData)
        }
    }
}
//各ページ先のdiv要素の参照をまとめるオブジェクト
const page={
    form:document.getElementById("form-page"),
    main:document.getElementById("main"),
    sub:document.getElementById("sub")
};
//minからmaxまでの値をランダムに返す。確率は一様分布。
function randomNum(min,max){
    return (max-min)*Math.random()+min
}
function removeSpace(str){
    while(true){
        let tmpstr=str
        str=str.replace(" ","")
        if(tmpstr===str)return str;
    }
}
//money(数値)を受け取り、カンマをつけ¥を付けた文字列を返す
function getMoneyLabel(money){
    let str=String(money);
    let i=3;
    let j=0;
    while(i<str.length){
        if(j>3){
            console.log("桁あふれの可能性があります");
        }
        j++;
        start=str.slice(0,-i);
        end=str.slice(-i);
        str=start+","+end;
        i+=4;
    }
    return "¥"+str;
}
//現在の要素と次の要素を受け取り、それぞれnone,blockする
function toggleBlockNone(currentEle,nextEle){
    nextEle.classList.remove("d-none");
    nextEle.classList.add("d-block");
    currentEle.classList.remove("d-block");
    currentEle.classList.add("d-none");

}
//現在のページとユーザーデータを渡し、メインページへ移動する 現在のページの中身は削除される。
function changeMainPage(currentPage,userData){
    currentPage.innerHTML="";
    page.main.innerHTML="";
    page.main.append(getTemplateDiv.mainPage(userData,itemsList));
    toggleBlockNone(currentPage,page.main);
}
function changeFormPage(currentPage){
    currentPage.innerHTML="";
    page.form.innerHTML="";
    page.form.append(getTemplateDiv.formPage());
    toggleBlockNone(currentPage,page.form);
}
//フォーム画面でnewを押したときに実行される。
function gameStart(){
    const currentUserData =new userData(document.getElementsByName("name")[0].value,document.getElementsByName("age")[0].value,itemsList)
    for(let i=1;i<4;i++){
        itemsList[i].resetData();
    }
    changeMainPage(page.form,currentUserData);
    createGraph(itemsList);
    timeConfig.scale=1;
    timeConfig.updateDataID= setInterval(function(){
        updateData(currentUserData,itemsList);
    },Math.floor(1000/timeConfig.scale))
}

//各ページへテスト値を入力して直接飛ぶ
let testPage={
    main(){
        document.getElementsByName("name")[0].value="test Name";
        document.getElementsByName("age")[0].value=20;
        document.getElementsByName("new")[0].click();
    },
    discription(){
        this.main();
        document.querySelectorAll(".item-tab")[5].click();
    }
}




function updateData(currentUserData,itemsList){
    currentUserData.day++;
        currentUserData.updateCash(currentUserData.dailyIncome);
        currentUserData.updateAge();
        for(let i=1;i<4;i++){
            canvasAction.updateCanvas(charts[itemsList[i].name],itemsList[i],currentUserData);
        }
        dataLabelUpdate.itemContainer(currentUserData,itemsList)
        dataLabelUpdate.main(currentUserData);
        let discriptionContainer=document.querySelector(".stock");
        if(discriptionContainer!==null){
            discriptionChart.update()
            discriptionPage.updateLabel(currentUserData);
        }
}

function createGraph(itemsList){
    
    for(let i=1;i<4;i++){
        charts[itemsList[i].name]=new Chart(
            document.getElementById(`${itemsList[i].name}-canvas`),
            new chartConfig
        );
    }  
}

function createGraphDiscription(stock){
    
    discriptionChart=new Chart(
        document.querySelector(`#stock-canvas`),
        charts[stock.name].config
    )
}
