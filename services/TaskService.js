module.exports = {
  findTaskInList(list, taskId) {
    return list.Tasks.find(function(taskInList) {
      return taskInList.id === parseInt(taskId)
    })
  }
}
