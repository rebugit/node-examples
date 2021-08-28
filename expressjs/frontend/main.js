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
    const todoListItem = $('.todo-list');
    const AddTodoButton = $('.todo-list-add-btn');

    function appendTodo(todo) {
      console.log(todo.city)
      todoListItem.append(
        `<li>
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
<!--           <button style="margin-left: 5px;padding: 5px" type="button" class="btn btn-info btn-sm">Check weather</button>-->
           <i data-id="${todo.id}" class='remove mdi mdi-close-circle-outline'></i> 
          </li>`
      );
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
        .post(`${window.__env__.API_ENDPOINT}/todos`, item)
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
        .delete(`${window.__env__.API_ENDPOINT}/todos/${todoId}`)
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
      const item = {
        date: rescheduleModalDate.val(),
        city: rescheduleModalCity.val()
      }
      const todoId = rescheduleModalId.val();
      axios
        .put(`${window.__env__.API_ENDPOINT}/todos/${todoId}`, item)
        .then(resp => {
          $('#rescheduleModal').modal('hide')
          $(`button[data-id]=${todoId}`)
        })
    })

    window.onload = function () {
      axios.get(`${window.__env__.API_ENDPOINT}/todos`).then(resp => {
        resp.data.data.forEach(todo => {
          console.log(todo)
          appendTodo(todo)
        })
      })
    }
  });
})(jQuery);