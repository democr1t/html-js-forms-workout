
const form = document.getElementById('search');
form.addEventListener('submit', (evt) => 
{
    evt.preventDefault()
    const data = new FormData(form);
    const obj = {};

    for (const key of data.keys()) {     
        obj[key] = data.get(key);
    }

    fetch(form.action +"?" + (new URLSearchParams(obj)).toString(), {
        method: form.method.toUpperCase(), mode:"no-cors",
        headers: {
            'Content-Type': 'application/json'
        },
        
    });
});
alert("works")
    // const body = JSON.stringify(obj);
    // console.log(evt.target)
    // console.log("OBJ: " + obj)
    // console.log("form: " + form)
    // console.log("data: " + data)
    // console.log("data-keys: " + data.keys)
    // console.log("obj[key]: " + obj[key])