(function ($) {
  'use strict';
  $(function () {
    const todoTask = $('#input__task');
    const todoCity = $('#input__city');
    const todoDate = $('#input__date');
    const rescheduleModalCity = $('#reschedule-modal__input__city');
    const rescheduleModalDate = $('#reschedule-modal__input__date');
    const rescheduleModalId = $('#reschedule-modal__input__id');
    const rescheduleModalSaveButton = $('#reschedule-modal__input__save-btn')

    const loginModalEmail = $('#login-modal__input__email');
    const loginModalPassword = $('#login-modal__input__password');
    const loginModalLoginButton = $('#login-modal__input__login-btn');
    const todoListItem = $('.todo-list');
    const AddTodoButton = $('.todo-list-add-btn');
    const logoutButton = $('#logout-button');

    function isToday(todoDate) {
      return new Date().toISOString().split('T')[0] === todoDate
    }

    function renderTodoListItem(todo) {
      return `<li id="${todo.id}" class="${isToday(todo.date) ? 'completed' : ''}">
          <div class='form-check'>
            <label class='form-check-label'>
               <input class='checkbox' type='checkbox' />`
        + `<b>${todo.task}</b>, in: <b>${todo.city}</b> on <b>${new Date(todo.date).toDateString()}</b>, forecasted weather: ${todo.weather.emoji}` +
        `<i class='input-helper'></i>
             </label>
           </div>
           <button 
              data-id="${todo.id}" 
              data-date="${todo.date}" 
              data-city="${todo.city}" 
              data-task="${todo.task}" 
              style="margin-left: 10px;padding: 5px" 
              type="button" 
              data-toggle="modal"
              data-target="#rescheduleModal"
              class="reschedule btn btn-primary btn-sm"
           >
              Reschedule
           </button>
           <i data-id="${todo.id}" class='remove mdi mdi-close-circle-outline'></i> 
          </li>`
    }

    function appendTodo(todo) {
      console.log(todo.city)
      todoListItem.append(renderTodoListItem(todo));
    }

    AddTodoButton.on("click", function (event) {
      event.preventDefault();
      const item = {
        task: todoTask.val(),
        date: todoDate.val(),
        city: todoCity.val()
      }
      console.log(item)
      AddTodoButton.prop('disabled', true);
      axios
        .post(
          `${window.__env__.API_ENDPOINT}/todos`,
          item,
          {headers: {'Authorization': localStorage.getItem('token')}}
        )
        .then(resp => {
          appendTodo(resp.data.data)
        })
        .finally(() => {
          AddTodoButton.prop('disabled', false);
        })
    });

    todoListItem.on('change', '.checkbox', function () {
      if ($(this).attr('checked')) {
        $(this).removeAttr('checked');
      } else {
        $(this).attr('checked', 'checked');
      }

      $(this).closest("li").toggleClass('completed');
    });

    todoListItem.on('click', '.remove', function () {
      const element = $(this)
      const todoId = element.attr("data-id")
      axios
        .delete(
          `${window.__env__.API_ENDPOINT}/todos/${todoId}`,
          {headers: {'Authorization': localStorage.getItem('token')}}
        )
        .then(() => {
          element.parent().remove();
        })
    });

    todoListItem.on('click', '.reschedule', function () {
      const modalTitleTask = $('#reschedule-modal__title__task')
      const element = $(this)
      const todoId = element.attr("data-id")
      const city = element.attr("data-city")
      const date = element.attr("data-date")
      const task = element.attr("data-task")
      rescheduleModalCity.val(city)
      rescheduleModalDate.val(date)
      rescheduleModalId.val(todoId)
      modalTitleTask.html(`Reschedule: <b>${task}</b>`)
    })

    rescheduleModalSaveButton.on('click', function () {
      rescheduleModalSaveButton.prop('disabled', true);
      const item = {
        date: rescheduleModalDate.val(),
        city: rescheduleModalCity.val()
      }
      const todoId = rescheduleModalId.val();
      axios
        .put(
          `${window.__env__.API_ENDPOINT}/todos/${todoId}/reschedule`,
          item,
          {headers: {'Authorization': localStorage.getItem('token')}}
        )
        .then(resp => {
          $('#rescheduleModal').modal('hide')
          $(`#${todoId}`).replaceWith(renderTodoListItem(resp.data.data))
        })
        .finally(() => {
          rescheduleModalSaveButton.prop('disabled', false);
        })
    })

    loginModalLoginButton.on('click', function () {
      loginModalLoginButton.prop('disabled', true);
      const item = {
        email: loginModalEmail.val(),
        password: loginModalPassword.val()
      }
      axios
        .post(
          `${window.__env__.API_ENDPOINT}/login`,
          item,
          {headers: {'Authorization': localStorage.getItem('token')}}
        )
        .then(resp => {
          $('#loginModal').modal('hide')
          localStorage.setItem('token', resp.data.token)
        })
        .finally(() => {
          loginModalLoginButton.prop('disabled', false);
          location.reload()
        })
    })

    logoutButton.on('click', function () {
      localStorage.removeItem('token')
      location.reload()
    })

    window.onload = function () {
      axios
        .get(
          `${window.__env__.API_ENDPOINT}/todos`,
          {headers: {'Authorization': localStorage.getItem('token')}}
        )
        .then(resp => {
          resp.data.data.forEach(todo => {
            console.log(todo)
            appendTodo(todo)
          })
        })
        .catch(err => {
          if (err.response) {
            if (err.response.status === 401) {
              $('#loginModal').modal('show')
              return
            }
            console.log(err)
          }
        })
    }
  });
})(jQuery);