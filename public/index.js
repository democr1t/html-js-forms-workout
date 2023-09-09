ValidateSearch()
ValidateOtherForms()

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

function ValidateOtherForms()
{
    const aIDsToValidate = ['sign-up', 'delivery', 'pay']

    for (let i = 0; i < aIDsToValidate.length; i++)
     {
       
        const form = document.getElementById(aIDsToValidate[i])
        for (const child of form.children) {
            console.log(child.tagName);
          }
        form.addEventListener('submit', (evt) =>
        {        
            evt.preventDefault()
            SendAsJson(form)
        })        
    }
}


function SendAsJson(form)
{
    const data = new FormData(form);
    const obj = {}

    for (const key of data.keys()) {
        obj[key] = data.get(key);
    }

    const body = JSON.stringify(obj);

    fetch(form.action, 
        {
            method: form.method,
            headers: {
            'Content-Type': 'application/json'
        },
        body
        }).then(res => res.json())
    .then((data) => {
    const error = data.errors;
    AppendError(form,error);
    })
    .catch((error) => console.log('Ошибка', error));
}

function AppendError(elementToAppend, error)
{   
    const aChildren = elementToAppend.children

    if(aChildren.includes("P"))
    {
        alert("IT CONTAINS")
    }
    else
    {
        const p = document.createElement('p')
        p.textContent = "Error: "  + error
        p.className = "error-p"
        elementToAppend.appendChild(p)
    }  
}