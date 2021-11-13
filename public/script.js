$(document).ready(function() { 

    $('a#search').click((e)=>{
            e.preventDefault();
            $('#search-form').submit();
        });
        
    $('#mybooks').on("click",".cancelReserve", ()=>{
        alert('cancel reserve clicked')
        $.ajax({
            url : '/books/cancel/' + $("#cancelReserve").attr('name'),
            type : patch,
            success : (data)=>{
                if(data.message == 'success'){ 
                    alert('Reserve Cancelled Successfully');
                    // $(location).attr('href','mybooks'); 
                }
                else{alert('something went wrong')}
            }
        });
    });
//     $('.login-form').submit((e)=>{
//         e.preventDefault();
//         let data = {
//             email : $('#email').val().toLowerCase(),
//             password : $('#password').val()
//         };
//         $.ajax({
//             url : '/user/login',
//             type : 'post',
//             contentType : 'application/json',
//             data : JSON.stringify(data)
//         });
//     });

//     $('.register-form').submit((e)=>{
//       e.preventDefault();
//       let data = {
//           firstName : $('#first-name').val(),
//           lastName : $('#last-name').val(),
//           email : $('#email').val().toLowerCase(),
//           password : $('#password').val(),
//           passwordConfirm: $('#passwordConfirm').val()
//       };
//       $.ajax({
//           url : '/user/signup',
//           type : 'post',
//           contentType : 'application/json',
//           data : JSON.stringify(data),
//           success : (data)=>{
//              if(data.status == 'success'){
//                alert('you have signed up');
//                $(location).attr('href','/');
//             }else{
//                 alert(data.access);
//             }
//           },
//           error : (data)=>{
//             alert('an error occured');
//           }
//       });
//   });
});