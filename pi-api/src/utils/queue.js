class Queue {
  tasks = [];
  count = 0;

  push(elem) {
    this.tasks.push(elem);
    this.count++;
  }

  pull() {
    if (this.count === 0) {
      return null;
    }
    this.count--;
    return this.tasks.shift();
  }
}

module.exports = Queue;
