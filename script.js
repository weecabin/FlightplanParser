var flightplan;


function SetupParseFlightplan()
{
  flightplan=get("fp");
  AddStatus("Status...");

  let canvasdiv = document.getElementById("canvasdiv"); 
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.width=400;
  canvas.heighht=400;

  this.ctx.translate(0,this.canvas.height)
  this.ctx.scale(1,-1);

  DrawPath([[0,0],[400,400]]);
  DrawPath([[0,400],[400,0]]);
}


function dropfp(event) 
{
  AddStatus("In dropfp");
  /*event.preventDefault();
  var files = event.dataTransfer.files;
  AddStatus("Files dropped = "+files.length)*/
}

//var testcount=0;
var routeList;
function Parse()
{
  try
  { 
    AddStatus("Entering Parse");
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(flightplan.value,"text/xml");

    // create a lookup table of waypoints.
    let waypoints = xmlDoc.getElementsByTagName("waypoint");
    let wplookup=[];
    for(let waypoint of waypoints)
    { 
      let wpobj = {id:"",lat:"",lon:""};
      for(let wpch of waypoint.childNodes)
      {
        switch (wpch.nodeName)
        {
        case "identifier":
        wpobj.id=wpch.childNodes[0].nodeValue;
        break;
        case "lat":
        wpobj.lat=wpch.childNodes[0].nodeValue;
        break;
        case "lon":
        wpobj.lon=wpch.childNodes[0].nodeValue;
        break;
        }
      }
      wplookup.push(wpobj);
    }
    AddStatus("Waypoint Lookup Table");
    AddStatus(JSON.stringify(wplookup));

    // get the route
    let route = xmlDoc.getElementsByTagName("waypoint-identifier");
    AddStatus(JSON.stringify(route));
    AddStatus(route.length+" route points");
    let i = 0;
    AddStatus("Route with lat/lon...");
    routelist=[];
    for(let routepoint of route)
    {
      let wp = routepoint.childNodes[0].nodeValue;
      let lat = wplookup.filter(x=>x.id==wp)[0].lat;
      let lon = wplookup.filter(x=>x.id==wp)[0].lon;
      let wpstr = wp+" = ("+lat+","+lon+")";
      AddStatus(wpstr);
      routelist.push({name:wp,lat:lat,lon:lon,dx:0,x:0,dy:0,y:0});
    }
    UpdateLatLonTable();
  }
  catch(err)
  {
    AddStatus(err.message);
  }
}

function UpdateLatLonTable(routeobj=routelist)  
{
  AddStatus("in UpdateLatLonTable");
  AddStatus("routeobj...");
  AddStatus(JSON.stringify(routeobj));
  let wptable = new MyTable(["Name","Latitude","Longitude","dy","y","dx","x"],"routelatlon","floatleft");
  for (let fix of routeobj)
  {
    AddStatus("fix="+JSON.stringify(fix));
    wptable.AddRow([fix.name,Number(fix.lat).toFixed(6),Number(fix.lon).toFixed(6),Number(fix.dy).toFixed(4),Number(fix.y).toFixed(4),Number(fix.dx).toFixed(4),Number(fix.x).toFixed(4)])
  }
  get("routetable").innerHTML=wptable.GetHTML();
}

function PlotPoints()
{
  ClearCanvas();
  //AddStatus("Route...");
  //AddStatus("routelist...");
  //AddStatus(JSON.stringify(routelist));
  let prevfix;
  let plotpoints=[];
  for(let fix of routelist)
  {
    //AddStatus("fix="+JSON.stringify(fix));
    if (prevfix==undefined)
    {
      fix.dx=0;
      fix.dy=0;
      plotpoints.push([0,0]);
    }
    else
    {
      let dxdy=DistHeadingDxDy(Number(prevfix.lat),Number(prevfix.lon),
               Number(fix.lat),Number(fix.lon));
      //AddStatus("dxdy="+dxdy);
      fix.dx=dxdy[2];
      fix.dy=dxdy[3];
      fix.x=prevfix.x+fix.dx;
      fix.y=prevfix.y+fix.dy;
      plotpoints.push([Number(fix.x),Number(fix.y)]);
    }
    prevfix=JSON.parse(JSON.stringify(fix));
    //AddStatus("prevfix="+JSON.stringify(prevfix));
  }
  AddStatus("Route with dx dy");
  AddStatus(JSON.stringify(routelist));
  UpdateLatLonTable();

  DrawPath(plotpoints);
}

