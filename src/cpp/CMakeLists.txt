cmake_minimum_required(VERSION 3.31)
project(hilbert_curve_sort)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(.)

add_executable(hilbert_curve_sort
        hilbert_curve_sort.h
        hilbert_curve_sort.cc)
