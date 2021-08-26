(function ($) {
  'use strict';
  $(function () {
    const todoTask = $('#input__task');
    const todoCity = $('#input__city');
    const todoDate = $('#input__date');
    const todoListItem = $('.todo-list');

    function appendTodo(todo) {
      todoListItem.append(
        `<li>
          <div class='form-check'>
            <label class='form-check-label'>
               <input class='checkbox' type='checkbox' />`
                + `${todo.task}, in: <b>${todo.city}</b> on ${new Date(todo.date).toDateString()}` +
              `<i class='input-helper'></i>
             </label>
           </div>
           <button style="margin-left: 10px;padding: 5px" type="button" class="btn btn-primary btn-sm">Reschedule</button>
           <button style="margin-left: 5px;padding: 5px" type="button" class="btn btn-info btn-sm">Check weather</button>
           <i class='remove mdi mdi-close-circle-outline'></i> 
          </li>`
      );
    }

    $('.todo-list-add-btn').on("click", function (event) {
      event.preventDefault();
      const item = {
        task: todoTask.val(),
        date: todoDate.val(),
        city: todoCity.val()
      }
      console.log(item)

      axios.post(`${window.__env__.API_ENDPOINT}/todos`, item).then(resp => {
        appendTodo(resp.data.data)
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
      $(this).parent().remove();
    });


    window.onload = function () {
      axios.get(`${window.__env__.API_ENDPOINT}/todos`).then(resp => {
        resp.data.data.forEach(todo => {
          appendTodo(todo)
        })
      })
    }
  });
})(jQuery);