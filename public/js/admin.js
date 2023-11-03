const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement = btn.closest('article')

    // Delete on the DOM as well as the server.
    // fetch function returns a Promise that resolves with the response from the server.
    // sends http requests
    fetch('/admin/product/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    }).
    then(result => {
        console.log(result)
        productElement.remove(productElement)
    })
    .catch(err => {
        console.log(err)
    })
};