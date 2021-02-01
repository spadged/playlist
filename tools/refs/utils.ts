declare var require:any;

class Utils
{
	private fs:any = require("fs");
	
	public generateUUID():string
	{
    	var d:number = new Date().getTime();

    	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
			/[xy]/g, 
			function(c):any
			{
				var r = (d + Math.random() * 16 ) % 16 | 0;
        
				d = Math.floor(d/16);

        		return (c == 'x' ? r : ( r&0x3 | 0x8) ).toString(16);
			}
		);

		return uuid;
	}

	public readDir(path:String):Array<string>
	{
		return this.fs.readdirSync(path);
	}
	
	public openJsonFile(path:string):any
	{
		return JSON.parse(this.openFile(path));
	}

	public openFile(path:string):string
	{
		return this.fs.readFileSync(path, "utf8");
	}

	public saveJsonFile(path:string, data:any):void
	{
		this.saveFile(path, JSON.stringify(data, null, '\t'));
	}

	private saveFile(path:string, data:string):void
	{
		this.fs.writeFileSync(path, data);
	}
}