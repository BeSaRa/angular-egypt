import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { TodoService } from '../services/todo-service';
import { TodoContract } from '../contracts/todo-contract';
import { LookupService } from '../services/lookup-service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import swal from 'sweetalert';

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  publicTemplate = viewChild.required('publicTemp', {read: TemplateRef})
  privateTemplate = viewChild.required('privateTemp', {read: TemplateRef})
  archivedTemplate = viewChild.required('archivedTemp', {read: TemplateRef})

  todoService = inject(TodoService)
  todos = signal<TodoContract[]>([])
  lookups = inject(LookupService).lookups
  lookupMap = inject(LookupService).lookupsMap
  addMode = signal(false)
  fb = inject(FormBuilder)
  form = this.fb.nonNullable.group({
    id: [''],
    title: ['', Validators.required],
    lookupId: ['', Validators.required],
  })
  editItem: undefined | TodoContract

  templates = computed(() => {
    return {
      Public: this.publicTemplate(),
      Private: this.privateTemplate(),
      Archived: this.archivedTemplate()
    }
  })


  ngOnInit(): void {
    this.todoService.load().subscribe(todos => this.todos.set(todos))
  }

  editTodo(todo: TodoContract) {
    this.editItem = todo;
    this.form.patchValue({
      ...todo
    })
  }

  async deleteTodo(todo: TodoContract) {
    await swal({
      text: 'Are you sure you want to delete it?',
      icon: 'warning',
      dangerMode: true,
      buttons: {
        cancel: true,
        confirm: true,
      },
    }).then((value) => {
      if (!value) return;

      this.todoService.delete(todo).subscribe(() => {
        swal('deleted successfully !!', '', 'success').then()
        this.todos.set(this.todos().filter(item => item.id !== todo.id))
      })
    })
  }

  lookupName(lookupTitle: string): TemplateRef<any> {
    return this.templates()[lookupTitle as 'Public' | 'Private' | 'Archived']
  }

  inEditMode(todo: TodoContract) {
    return todo.id === this.editItem?.id
  }

  cancel() {
    this.editItem = undefined
    this.form.reset()
  }

  save() {
    if (this.form.invalid) {
      swal('Please fill all the fields !!', 'Title, Privacy', 'error').then()
      return;
    }
    this.addMode.set(true)
    const todo = this.form.value as TodoContract;
    const saveOperation = this.editItem ? this.todoService.update(todo) : this.todoService.create(todo)
    saveOperation.subscribe((todo) => {
      this.todos.update(todos => [...todos, todo])
      swal(this.editItem ? 'Saved Successfully !!' : 'Created Successfully !!', '', 'success').then(() => {
        this.addMode.set(false)
      })
    })
  }

  isEmpty() {
    return this.form.value.title?.length === 0 && this.form.value.lookupId?.length === 0
  }

}
