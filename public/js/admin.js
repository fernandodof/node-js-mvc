const deleteProduct = (productId) => {
    const csrfToken = document.getElementById('csrfToken').value;

    fetch('/admin/product/' + productId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrfToken
        }
    }).then(result => {
        return result.json();
    }).then(() => {
        document.getElementById(productId).remove();
    }).catch(err => {
        console.log(err);
    })
};