var canvas;
var ctx;

function get(id)
{
  return document.getElementById(id);
}

var statusbox;
function AddStatus(str)
{
  get("status").value += "\n"+str;
}

class MyTable
{
  /*
  headings is an array of headings
  [[],[]...]
  optionally, specify the table id and class
  to use class only, set tblid parameter to undefined
  */
  constructor(headings,tblid="",tblclass="")
  {
    let tblidstr=tblid.length>0?" id=\""+tblid+"\"":"";
    let tblclassstr=tblid.length>0?" class=\""+tblclass+"\"":"";
    this.tbl="<table"+tblidstr+tblclassstr+"><tr>";
    AddStatus("table tag="+this.tbl);
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

function DrawPath(plotpoints,showVertices=true)
{
  AddStatus("Entering DrawPath");
    // make the data fit the plot
  // find the extremes of the data
  let xmin;
  let xmax;
  let ymin;
  let ymax;
  AddStatus("plotpoints"+JSON.stringify(plotpoints));
  for (let point of plotpoints)
  {
    let x=point[0];
    let y=point[1];
    AddStatus("x,y"+x+","+y);
    if (xmin==undefined)
    {
      xmin=xmax=x;
      ymin=ymax=y;
    }
    else
    {
      if (x<xmin)xmin=x;
      if (x>xmax)xmax=x;
      if (y<ymin)ymin=y;
      if (y>ymax)ymax=y;
    }
  }
  let xoffset=-xmin;
  let yoffset=-ymin;
  AddStatus("x/y offsets:"+xoffset+","+yoffset);
  
  /*
  calculate a single mulitplier used to scale all data to fit inside the plot extents.
  */
  let xmult=ymult=mult=1;
  AddStatus("multipliers="+xmult+","+ymult+","+mult);
  AddStatus("canvas="+canvas.width+","+canvas.height);
  if (xmax==xmin)
    xmult=1;
  else
    xmult=canvas.width/(xmax-xmin);
  if (ymax==ymin)
    ymult=1;
  else
    ymult=canvas.height/(ymax-ymin);
  // to keep the drawing to scale, only use one multiplier for x and y
  if ((xmult>=1 && ymult>=1))
    mult=xmult>ymult?ymult:xmult;
  else
    mult=xmult>ymult?ymult:xmult;
  AddStatus("multipliers x,y,selected="+xmult+","+ymult+","+mult);

  let firstpoint=true;
  for (let point of plotpoints)
  {
    let x = (point[0]+xoffset)*mult;
    let y = (point[1]+yoffset)*mult;
    AddStatus("plot x,y ="+x+","+y);
    if (firstpoint)
    {
      firstpoint=false;
      ctx.beginPath();
      ctx.moveTo(x,y);
    }
    else
    {
      ctx.lineTo(x,y);
    }
  } 
  ctx.stroke();

  if(showVertices)
  {
  AddStatus("Drawing Vertices");
    for(let point of plotpoints)
    {
      let x = (point[0]+xoffset)*mult;
      let y = (point[1]+yoffset)*mult;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
}

function ClearCanvas()
{
  AddStatus("Entering ClearCanvas");
  try
  {
    // Store the current transformation matrix
    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0,0, canvas.width, canvas.height);
    
    // Restore the transform
    ctx.restore();
  }
  catch(err)
  {
    AddStatus(err.message ,false,true);
  }
  AddStatus("Exiting ClearCanvas");
}
