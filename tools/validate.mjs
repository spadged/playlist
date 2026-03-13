import fs from 'fs-extra';

class Validate {

    constructor()
    {
        const data = fs.readJSONSync("../output/years.json");

        data.forEach(year => {

            if(year.children.length != 12)
            {
                console.log(`${year.name} ! ${year.children.length} months`);
            }

            year.children.forEach(month => {

                if(month.tracks.length != 5 && month.tracks.length != 10)
                {
                    console.log(`${year.name} > ${month.name} ! ${month.tracks.length} tracks`);
                }                
            });
        });
    }
}

new Validate();