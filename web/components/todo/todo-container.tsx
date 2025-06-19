"use client";

import { useSearchParams } from "next/navigation";
import { gql, useQuery, useMutation } from "@apollo/client";
import { TodoForm } from "./todo-form";
import { TodoFilters } from "./todo-filters";
import { TodoList } from "./todo-list";
// import { Button } from "../ui/button";
import { Paginator } from "../ui/paginator";
import { updateUrlParams } from "@/lib/utils";

const GET_TODOS = gql`
  query GetTodos(
    $offset: Int
    $limit: Int
    $search: String
    $sortOrder: String
    $status: String
  ) {
    todos(
      offset: $offset
      limit: $limit
      search: $search
      sortOrder: $sortOrder
      status: $status
    ) {
      todos {
        id
        title
        description
        completed
        createdAt
        updatedAt
      }
      totalCount
      hasMore
    }
  }
`;

const CREATE_TODO = gql`
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      title
      description
      completed
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TODO = gql`
  mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      id
      title
      description
      completed
      createdAt
      updatedAt
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

export function TodoContainer() {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const sortOrder = searchParams.get("sort") || "asc";
  const filterStatus = searchParams.get("status") || "all";
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "5");

  const { loading, error, data, refetch } = useQuery(GET_TODOS, {
    variables: {
      offset: (page - 1) * pageSize,
      limit: pageSize,
      search,
      sortOrder,
      status: filterStatus,
    },
    fetchPolicy: "network-only",
  });

  const [createTodo, { loading: createLoading }] = useMutation(CREATE_TODO, {
    onCompleted: () => {
      refetch();
    },
  });

  const [updateTodo] = useMutation(UPDATE_TODO, {
    onCompleted: () => {
      refetch();
    },
  });

  const [deleteTodo] = useMutation(DELETE_TODO, {
    onCompleted: () => {
      refetch();
    },
  });

  function handleCreateTodo(values: { title: string; description?: string }) {
    createTodo({
      variables: {
        input: values,
      },
    });
  }

  function handleSearch(value: string) {
    updateUrlParams({ search: value, page: "1" });
  }

  function handleSort(value: string) {
    updateUrlParams({ sort: value, page: "1" });
  }

  function handleStatusFilter(value: string) {
    updateUrlParams({ status: value, page: "1" });
  }

  function handleToggleComplete(id: string, completed: boolean) {
    updateTodo({
      variables: {
        id,
        input: {
          completed: !completed,
        },
      },
    });
  }

  function handleDelete(id: string) {
    deleteTodo({
      variables: {
        id,
      },
    });
  }

  //   function handleNextPage() {
  //     if (data?.todos?.hasMore) {
  //       updateUrlParams({ page: String(page + 1) });
  //     }
  //   }

  //   function handlePrevPage() {
  //     if (page > 1) {
  //       updateUrlParams({ page: String(page - 1) });
  //     }
  //   }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Your Tasks</h1>
        <p className="text-muted-foreground">
          Manage your tasks and stay organized
        </p>
      </div>

      <TodoForm onSubmit={handleCreateTodo} loading={createLoading} />

      <TodoFilters
        search={search}
        sortOrder={sortOrder}
        status={filterStatus}
        onSearch={handleSearch}
        onSort={handleSort}
        onStatusChange={handleStatusFilter}
      />

      <div className="space-y-4">
        <TodoList
          todos={data?.todos?.todos || []}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
          loading={loading}
          error={!!error}
          search={search}
        />

        {/* {data?.todos?.totalCount > pageSize && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(data?.todos?.totalCount / pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!data?.todos?.hasMore}
            >
              Next
            </Button>
          </div>
        )} */}
        {data?.todos?.totalCount > 0 && (
          <Paginator
            totalCount={data?.todos?.totalCount}
            page={page}
            pageSize={pageSize}
            pageSizeSelectOptions={{
              pageSizeOptions: [5, 10, 25, 50, 100],
            }}
          />
        )}
      </div>
    </div>
  );
}
