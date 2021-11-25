
/*
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
*/


  const config = {
    type: 'line',
    data: {
      labels: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
      ],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [0, 10, 5, 2, 20, 30, 45],
      }]
    },
    options: {
      animation:false,
      responsive:true,
      
      plugins:{
        legend:{
          display:false
        },
      },
    },
    
  };
  let myChart
  let canvasAction={
    randomize(chart) {
      chart.data.datasets.forEach(dataset => {
        for(let i=0;i<dataset.data.length;i++){
          console.log(i,dataset.data[i])
          dataset.data[i]=randomNum(0,100);
        }
      })
      chart.update();
    },
    addData(chart){
    const data = chart.data;
    if (data.datasets.length > 0) {
      data.labels[data.labels.length-1]="";
      data.labels.push("now");
      console.log(data.labels.length);
      for (let index = 0; index < data.datasets.length; ++index) {
        data.datasets[index].data.push(randomNum(0,100));
      }

      chart.update();
    }
  },
    removeData(chart){
      chart.data.datasets.forEach(dataset=>{
        dataset.data.shift();
        dataset.data.labels.shift();
      });
      chart.update();
    }
  }



    function randomNum(min,max){
      return (max-min)*Math.random()+min
  }

  document.getElementById("butn").addEventListener("click",function(){
    //canvasAction.randomize(myChart);
    //console.log("a");
    myChart.destroy();
    myChart=new Chart(
      document.getElementById('myChart2'),
      config
    );
  }) ;
  document.getElementById("add").addEventListener("click",function(){
    //canvasAction.addData(myChart);
    
    document.body.append(test.Method());
    
    console.log(document.body.innerHTML);
  }) ;
  document.getElementById("remove").addEventListener("click",function(){
    //canvasAction.addData(myChart);
    //canvasAction.removeData(myChart);
    document.getElementById("myChart").remove();
  }) ;
  console.log(document.body.innerHTML);
  /*
  myChart=new Chart(
    document.getElementById('myChart'),
    config
  );
  */
  const test={
    Method(){
      let container=document.createElement("div");
      container.innerHTML=`
      <div id="target"></div>
      `;
      let t= document.createElement("canvas");
      container.querySelector("#target").append(t)
      t.id="myChart1";
      myChart=new Chart(
        t,
        config
      );
      return container;
    }
  }

  console.log(myChart)