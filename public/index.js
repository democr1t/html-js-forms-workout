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
        
        form.addEventListener('submit', (evt) =>
        {    
            evt.preventDefault()
            ClearDataErrors(form);              
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
    AppendResponse(form,data);
    })
    .catch((error) => console.log('Ошибка', error));
}

function AppendResponse(form, responseData)
{   
    if(responseData.data == null && responseData.errors == null)
    {
        return;
    }

    

    if(responseData.errors != null)
    {           
        responseData.errors.forEach((element) => {
            if(form.elements[element[0]])
            {
               const pError = form.querySelector(`[data-errors="${element[0]}"]`)
               pError.style.display = "block";
               pError.textContent = element[1]
            } 
        })
        
    }
    else if(responseData.data != null)
    {
        const p = form.querySelector('[data-response]')
        p.style.display = "block";
        p.textContent = "Success request: "  + JSON.stringify(responseData.data)
        p.className = "response-p"       
    }      
}

function ClearDataErrors(form)
{
    const pErrors = form.querySelectorAll('[data-errors]')
    pErrors.forEach((element) => {
        element.style.display = "none";
        element.textContent = "";
    })
    const pResponse = form.querySelector('[data-response]')
    pResponse.textContent = "";
    pResponse.style.display = "none";
}

