import React, { useState, useEffect } from "react";
import "./api";

interface TodoItem {
  id: string;
  description: string;
  status: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [dataArray, setDataArray] = useState<TodoItem[]>([]);
  const [itemCount, setItemCount] = useState<number>(0);
  const [filter, setFilter] = useState<"all" | "active" | "complete">("all");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [showData, setShowData] = useState<boolean>(false);
  const [responseData, setResponseData] = useState<TodoItem[]>([]);
  const [isChecked, setIschecked] = React.useState(false);
  const [activeFilter, setActiveFilter] = useState("");
  const [clickCounts, setClickCounts] = useState<{ [key: string]: number }>({});
 

  useEffect(() => {
    const api = "http://localhost:5005/todo";
    fetch(api, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const incomplete = data.filter((item: TodoItem) => !item.completed);
        setDataArray(incomplete); //hiển thị cvc chưa hoàn thành khi load lại web
        setResponseData(data); //lưu all cvc
        setShowData(true);
      });
    if (dataArray.length > 0) {
      setShowData(true);
    } else {
      setShowData(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // const getName = () => {
  //   if (!inputValue) return;

  //   const foundItem = dataArray.find((item) => item.name === inputValue);
  //   return foundItem ? foundItem.name : "Không tìm thấy tên";
  // };

  const postData = (data: string) => {
    console.log(data);
    const api = "http://localhost:5005/todo";
    fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description: data }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResponseData((prevData) => [...prevData, data]);
        setShowData(true);
        setInputValue("");
      })
      .catch((error) => {
        console.error("Error posting data:", error);
        setResponseData([]);
        setShowData(false);
      });
  };

  const updateLocalStorage = (data: TodoItem[]) => {
    localStorage.setItem("todoData", JSON.stringify(data));
  };

  const putData = (id: string, updatedTodo: Partial<TodoItem>) => {
    console.log(id);
    const api = `http://localhost:3000/todo/${id}`;
    setResponseData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, ...updatedTodo } : item
      )
    );
    console.log(updatedTodo);
    fetch(api, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description: null, status: "COMPLETED" }),
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log("update:", data);
        setResponseData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, ...updatedTodo } : item
          )
        );
      });
  };

  useEffect(() => {
    const savedData = localStorage.getItem("todoData");
    if (savedData) {
      setResponseData(JSON.parse(savedData));
    } else {
      fetchData;
    }
  }, []);

  const fetchData = () => {
    fetch("http://localhost:5005/todo")
      .then((res) => res.json())
      .then((data) => {
        if (!localStorage.getItem("todoData")) {
          setResponseData(data);
          updateLocalStorage(data);
        }
      });
  };
  // putData(updatedData[index].id, { completed: updatedData[index].completed }); //gọi put cập nhật trạng thái công việc

  const deleteData = async (ids: string[]) => {
    const api = `http://localhost:5005/todo/delete`;
    // console.log("id delete", ids);
    try {
      const response = await fetch(api, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: ids }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setResponseData((prevData) => {
          const newData = prevData.filter((item) => !ids.includes(item.id));
          return newData;
        });
        const updateData = JSON.parse(
          localStorage.getItem("todoData") || "[]"
        ).filter((item: TodoItem) => !ids.includes(item.id));
        localStorage.setItem("todoData", JSON.stringify(updateData));
        return true;
      } else {
        console.error("Server responded with failure:", result);
        return false;
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      return false;
    }
  };

  const handleClearCompleted = async () => {
    const completedItems = responseData.filter((item) => item.completed);

    if (completedItems.length === 0) {
      console.log("No Complete");
      return;
    }

    const completeIds = completedItems.map((item) => item.id);

    try {
      const results = await deleteData(completeIds);
      if (results) {
        console.log("Successfully deleted all completed items");
        setResponseData((prevData) =>
          prevData.filter((item) => !completeIds.includes(item.id))
        );
        localStorage.setItem(
          "todoData",
          JSON.stringify(
            JSON.parse(localStorage.getItem("todoData") || "[]").filter(
              (item: TodoItem) => !completeIds.includes(item.id)
            )
          )
        );
      } else {
        console.error("Failed to delete some or all completed items");
      }
    } catch (error) {
      console.error("Error in handleClearCompleted:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      postData(inputValue);
    }
  };

  // const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter") {
  //     if (inputValue.trim()) {
  //       setDataArray([
  //         ...dataArray,
  //         { name: inputValue.trim(), completed: false },
  //       ]);
  //       setInputValue("");
  //       setItemCount(itemCount + 1);
  //     }
  //   }
  // };

  const handleFilterChange = (newFilter: "all" | "active" | "complete") => {
    setFilter(newFilter);
  };

  const toggleCompletion = (index: number) => {
    const item = responseData[index];
    const updatedCompletedStatus = !item.completed;
    const updatedTodo = {
      completed: updatedCompletedStatus,
      status: updatedCompletedStatus ? "COMPLETED" : "ACTIVE",
    };

    setResponseData((prevData) => {
      const newData = prevData.map((todoItem, idx) =>
        idx === index ? { ...todoItem, ...updatedTodo } : todoItem
      );
      updateLocalStorage(newData);
      return newData;
    });
    // updatedData[index].completed = !updatedData[index].completed;
    // // console.log(updatedData[index].completed);//ktra trạng thái
    // setResponseData(updatedData);
    putData(item.id, updatedTodo);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(responseData[index].description);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);//cập nhật giá trị
  };

  //nếu muốn cập nhật tên cv thì gọi putdata trong hàm này
  const handleEditBlur = () => {
    if (editIndex !== null) {
      const updatedTodo = {
        // ...responseData[editIndex],
        description: editValue.trim(),
      };
      putData(responseData[editIndex].id, updatedTodo);
      setResponseData((prevArray) =>
        prevArray.map((item, i) =>
          i === editIndex ? { ...item, name: editValue.trim() } : item
        )
      );
      setEditIndex(null);
      setEditValue("");
    }
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleEditBlur();
    }
  };
  // console.log(responseData);

  const filteredData =
    filter === "all"
      ? responseData
      : filter === "active"
      ? responseData.filter((item) => !item.completed)
      : filter === "complete"
      ? responseData.filter((item) => item.completed)
      : [];
  // console.log(filteredData);

  //tăng số lượng
  useEffect(() => {
    const quantityItem = responseData.filter((item) => !item.completed).length;
    setItemCount(quantityItem);
  }, [responseData]);

  const handleTrace = () => {
    setIschecked(!isChecked);
  };

  const getButtonClass = (id: string) => {
    const baseClasses =
      "border text-black block text-center transition duration-100 ease-in-out rounded-sm hover:border-red-600 focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-600 focus:ring-opacity-50";
    const focusClasses =
      "focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50";
    const clickCount = clickCounts[id] || 0;
    switch (clickCount) {
      case 1:
        return `${baseClasses} hover:border-red-600`; //di vào thì sẽ xuất hiện lên hover
      case 2:
        return `${baseClasses} border border-red-600 `; //nhấp 1 lần sẽ hiện ra border
      case 3:
        return `${baseClasses} border-red-700 ${focusClasses} `;
        
      default:
        return baseClasses;
    }
  };

  const handleClick = (id: string) => {
    setClickCounts((prevCounts) => ({
      ...prevCounts,
      [id]: ((prevCounts[id] || 0) + 1) % 3,
    }));
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <h1 className="text-[#b83f45] text-[80px] text-center pt-5">todos</h1>
      <main className="mt-6 max-w-xl mx-auto border relative shadow-2xl border-none">
        <div className="relative ">
          <input
            className="new-todo before: px-10 px box 0px 3px 8px focus:shadow-[0_0_2px_2px_#cf7d7d]  italic text-2xl min-h-14 
             w-full max-w-xl py-2 border-none border border-gray-600 focus:outline-none"
            type="text"
            value={inputValue || ""}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="icon-svg-input size-6 fa fa-check w-6 h-6 stroke-[3px] absolute right-[94%] top-[54%] transform -translate-y-1/2 cursor-pointer"
            onClick={handleTrace}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>

        {showData && (
          <div className=" bg-slate-50">
            <ul className="space-y-2 bg-white border-b border-t border-black/5">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <li
                    key={index}
                    className=" flex items-center border-none pb-3 pt-3 focus focus:border focus:border-red-500 shadow focus:shadow-[0_0_2px_2px_#cf7d7d]"
                    onDoubleClick={() => handleEdit(index)}
                  >
                    <label className="relative cursor-pointer">
                      <input
                        type="checkbox"
                        value={item.id}
                        checked={item.completed}
                        onChange={() => toggleCompletion(index)}
                        className=" sr-only peer shadow-[inset_0_-2px_1px_rgba(0,0,0,0.03)] focus:shadow-[0_0_2px_2px_#cf7d7d]"
                      />
                      <div
                        className="mt-1 border border-gray-500 rounded-full w-8 h-8 ml-2 transition duration-150 ease-in-out flex items-center justify-center
                             peer-focus:border-green-500 peer-checked:border-green-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className={`w-6 h-6 transition-colors duration-150 ease-in-out ${
                            item.completed
                              ? "text-green-500"
                              : "text-transparent"
                          }`}
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      </div>
                    </label>
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={handleEditChange}
                        onBlur={handleEditBlur}
                        onKeyDown={handleEnter}
                        className="w-full text-lg p-3 border border-gray-300 shadow-sm
                          transition duration-150 ease-in-out "
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`flex-1 pl-2 text-2xl text-black ml-4 ${
                          item.completed ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {item.description}
                      </span>
                    )}
                  </li>
                ))
              ) : (
                <p></p>
              )}
            </ul>

            <div className=" absolute cursor-default boxshadow-footer bg-white flex gap-10 items-center text-gray-600">
              <span className="ml-4 text-black">
                {itemCount} item{itemCount !== 1 ? "" : ""} left!
              </span>

              <div className=" relative ml-6 flex pl-12 ">
                <a
                  href="#"
                  className={`${getButtonClass(
                    "all"
                  )} text-black block h-7 w-12 text-center gap-2 transition duration-100 ease-in-out ${
                    activeFilter === "all"
                      ? " border-red-600 focus"
                      : " rounded-sm hover:border transition-colors duration-300 hover:border-red-600 focus:border focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 "
                  }`}
                  onClick={() => handleClick("all")}
                >
                  All
                </a>
                <a
                  href="#"
                  className={`${getButtonClass(
                    "active"
                  )} text-black block h-7 w-2/4 ml-2 text-center transition duration-100 ease-in-out ${
                    activeFilter === "all"
                      ? " border-red-600 focus "
                      : " rounded-sm hover:border transition-colors duration-300 hover:border-red-600 focus:border focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
                  }`}
                  onClick={() => handleClick("active")}
                >
                  Active
                </a>
                <a
                  href="#"
                  className={`${getButtonClass(
                    "complete"
                  )}   text-black h-7 w-4/5 text-center ml-3 transition duration-100 ease-in-out ${
                    activeFilter === "all"
                      ? " border-red-600 focus "
                      : " rounded-sm hover:border transition-colors duration-300 hover:border-red-600 focus:border focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-opacity-50"
                  }`}
                  onClick={() => handleClick("complete")}
                >
                  Completed
                </a>
              </div>
              <div className="clearComplete">
                <a
                  href="#"
                  className="text-black hover:underline ml-2"
                  onClick={handleClearCompleted}
                >
                  Clear completed
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
      <div className="mt-28 text-center text-customGray text-xs text-gray-700">
        <p className="mt-2">Double-click to edit a todo</p>
        <p className="mt-2">Created by the TodoMVC Team</p>
        <p className="mt-2">
          Part of{" "}
          <a className="hover:underline" href="https://todomvc.com/">
            TodoMVC
          </a>
        </p>
      </div>
    </div>
  );
};

export default App;
