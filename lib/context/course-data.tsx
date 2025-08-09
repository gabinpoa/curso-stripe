"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/lib/fs/queries";

type CourseDataContextType = {
  courseData: Product;
  setCourseData: React.Dispatch<React.SetStateAction<Product>>;
};

const CourseDataContext = createContext<CourseDataContextType | undefined>(
  undefined
);

export const CourseDataProvider = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: Product;
}) => {
  const [courseData, setCourseData] = useState<Product>(initialData);

  return (
    <CourseDataContext.Provider value={{ courseData, setCourseData }}>
      {children}
    </CourseDataContext.Provider>
  );
};

export const useCourseData = () => {
  const context = useContext(CourseDataContext);
  if (!context) {
    throw new Error("No context found for CourseDataProvider");
  }
  return context;
};
