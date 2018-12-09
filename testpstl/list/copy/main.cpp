#pragma comment(linker, "/HEAP:20000000")

#include <iostream>
#include <stdlib.h>
#include <stdint.h>
#include <functional>

#include "timer.h"

#include "tbb/tbb.h"
#include "pstl/execution"
#include "pstl/algorithm"

#define ARRSZ 30000000

typedef float mytype;

void reseedWith0(std::list<mytype>& a) {
	a.clear();
	for (size_t i = 0; i < ARRSZ; i++) {
		a.push_back(0);
	}
}

void pvec(std::list<mytype>& a, std::list<mytype>& b)
{
	Timer t;
	size_t sum;

	reseedWith0(b);
	sum = 0;
	for (mytype i : b) sum += i;
	std::cout << "Sum at B: " << sum << std::endl;

	sum = 0;
	for (mytype i : a) sum += i;
	std::cout << "Sum: " << sum << std::endl;

	t.start();
	std::copy(
		std::execution::par_unseq,
		a.begin(),
		a.end(),
		b.begin()
	);
	t.stop();

	sum = 0;
	for (mytype i : b) sum += i;
	std::cout << "Sum at B: " << sum << std::endl;

	std::cout << "Time for list parallel vectorized copy: " << t << std::endl << std::endl;
}

void vec(std::list<mytype>& a, std::list<mytype>& b)
{
	Timer t;
	size_t sum;

	reseedWith0(b);
	sum = 0;
	for (mytype i : b) sum += i;
	std::cout << "Sum at B: " << sum << std::endl;

	sum = 0;
	for (mytype i : a) sum += i;
	std::cout << "Sum: " << sum << std::endl;

	t.start();
	std::copy(
		std::execution::unseq,
		a.begin(),
		a.end(),
		b.begin()
	);
	t.stop();

	sum = 0;
	for (mytype i : b) sum += i;
	std::cout << "Sum at B: " << sum << std::endl;

	std::cout << "Time for list vectorized copy: " << t << std::endl << std::endl;
}

void par(std::list<mytype>& a, std::list<mytype>& b)
{
	Timer t;
	size_t sum;

	reseedWith0(b);
	sum = 0;
	for (mytype i : b) sum += i;
	std::cout << "Sum at B: " << sum << std::endl;

	sum = 0;
	for (mytype i : a) sum += i;
	std::cout << "Sum: " << sum << std::endl;

	t.start();
	std::copy(
		std::execution::par,
		a.begin(),
		a.end(),
		b.begin()
	);
	t.stop();

	sum = 0;
	for (mytype i : b) sum += i;
	std::cout << "Sum at B: " << sum << std::endl;

	std::cout << "Time for list parallel copy: " << t << std::endl << std::endl;
}

void serial(std::list<mytype>& a, std::list<mytype>& b)
{
	Timer t;
	size_t sum;

	reseedWith0(b);
	sum = 0;
	for (mytype i : b) sum += i;
	std::cout << "Sum at B: " << sum << std::endl;

	sum = 0;
	for (mytype i : a) sum += i;
	std::cout << "Sum: " << sum << std::endl;

	t.start();
	std::copy(
		std::execution::seq,
		a.begin(),
		a.end(),
		b.begin()
	);
	t.stop();

	sum = 0;
	for (mytype i : b) sum += i;
	std::cout << "Sum at B: " << sum << std::endl;

	std::cout << "Time for list serial copy: " << t << std::endl << std::endl;
}

int main()
{
	srand(1);

	std::list<mytype> a;
	std::list<mytype> b;
	size_t sum;

	for (size_t i = 0; i < ARRSZ; i++) {
		a.push_back(rand());
		b.push_back(0);
	}


	sum = 0;
	for (mytype i : a) sum += i;
	std::cout << "Correct sum: " << sum << std::endl;

	sum = 0;
	for (mytype i : b) sum += i;
	std::cout << "Sum at B: " << sum << std::endl;

	for (size_t i = 0; i < 3; i++) {
		std::cout << "==========" << std::endl;
		std::cout << "PASS " << i + 1 << std::endl;
		std::cout << "==========" << std::endl;

		serial(a, b);
		par(a, b);
		vec(a, b);
		pvec(a, b);
	}

	getchar();
	return 0;
}

