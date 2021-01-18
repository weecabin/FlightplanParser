$(function() {
  console.log('Parse Flightplan 001');
});

var statusbox;
var flightplan;

function get(id)
{
  return document.getElementById(id);
}

function setup()
{
  statusbox=get("status");
  flightplan=get("fp");
  AddStatus("Status...");
}

function dropfp(event) 
{
  AddStatus("In dropfp");
  /*event.preventDefault();
  var files = event.dataTransfer.files;
  AddStatus("Files dropped = "+files.length)*/
}

function AddStatus(str)
{
  statusbox.value += "\n"+str;
}

class MyTable
{
  // headings is an array of headings
  constructor(headings)
  {
    this.tbl="<table><tr>";
    for(let heading of headings)
    {
      this.tbl += "<th>"+heading+"</th>";
    }
    this.tbl += "</tr>"
  }
  AddRow(values)
  {
    this.tbl+="<tr>"
    for(let value of values)
    {
      this.tbl += "<td>"+value+"</td>"
    }
    this.tbl += "</tr>"
  }
  GetHTML()
  {
    this.tbl+="</table>"
    return this.tbl;
  }
}

var testcount=0;
function Parse()
{
  try
  { 
    AddStatus("Entering Parse");
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(flightplan.value,"text/xml");

    // create a lookup table of waypoints.
    let waypoints = xmlDoc.getElementsByTagName("waypoint");
    var wplookup=[];
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
    AddStatus("Route with lat/lon...");
    let wptable = new MyTable(["Name","Latitude","Longitude"]);
    for(let routepoint of route)
    {
      let wp = routepoint.childNodes[0].nodeValue;
      let lat = wplookup.filter(x=>x.id==wp)[0].lat;
      let lon = wplookup.filter(x=>x.id==wp)[0].lon;
      let wpstr = wp+" = ("+lat+","+lon+")";
      AddStatus(wpstr);
      wptable.AddRow([wp,lat,lon]);
    }
    get("routetable").innerHTML=wptable.GetHTML();
  }
  catch(err)
  {
    AddStatus(err.message);
  }
}
