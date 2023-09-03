alert("works")
ValidateSearch()

function ValidateSearch()
{
    const form = document.getElementById('search');
    form.addEventListener('submit', (evt) => 
    {
        const data = new FormData(form);
        const obj = {};
        const inlineStyles = data.styles
        inlineStyles.setAttribute('border', 'color:red; border: 1px solid red;') 
        //evt.preventDefault()
        
        for (const key of data.keys()) {     
            obj[key] = data.get(key);
        }

        fetch(form.action +"?" + (new URLSearchParams(obj)).toString(), {
            method: form.method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json'
            },
            
        });
    });
}




    // const body = JSON.stringify(obj);
    // console.log(evt.target)
    // console.log("OBJ: " + obj)
    // console.log("form: " + form)
    // console.log("data: " + data)
    // console.log("data-keys: " + data.keys)
    // console.log("obj[key]: " + obj[key])