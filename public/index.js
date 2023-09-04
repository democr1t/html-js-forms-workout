alert("works")
ValidateSearch()
ValidateSignUp()

function ValidateSearch()
{
    const form = document.getElementById('search');
    form.addEventListener('submit', (evt) => 
    {
        const data = new FormData(form);
        const obj = {};
        const inlineStyles = data.styles
        inlineStyles.setAttribute('border', 'color:red; border: 1px solid red;') 
        evt.preventDefault()
        
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

function ValidateSignUp()
{
    const form = document.getElementById('sign-up')

    form.addEventListener('submit', (evt) =>
    {        
        evt.preventDefault()
        SendAsJson(form)
    })
}

function SendAsJson(form)
{
    const data = new FormData(form);
    const obj = {}

    for (const key of data.keys()) {
        obj[key] = data.get(key);
    }

    const body = JSON.stringify(obj);

    fetch(form.action, {
        method: form.method,
        headers: {
            'Content-Type': 'application/json'
        },
        body
    }).then(res => res.json())
    .then((data) => {
    // обработка данных
    const error = data.errors;
    AppendError(form,error);
    })
    .catch((error) => console.log('Ошибка', error));
    // .then(response => AppendError(form, response.json().data.errors))
}

function AppendError(elementToAppend, error){
    const p = document.createElement('p')
    p.textContent = "Error: "  + error
    elementToAppend.appendChild(p)
}



    // const body = JSON.stringify(obj);
    // console.log(evt.target)
    // console.log("OBJ: " + obj)
    // console.log("form: " + form)
    // console.log("data: " + data)
    // console.log("data-keys: " + data.keys)
    // console.log("obj[key]: " + obj[key])