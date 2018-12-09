#include <iostream>
#include <stdlib.h>
#include <stdint.h>
#include <functional>

#include "timer.h"

#include "tbb/tbb.h"
#include "pstl/execution"
#include "pstl/algorithm"

#define ARRSZ 70000000

typedef uint16_t mytype;

template<class T>
void pvec(std::list<mytype>& a, T& action)
{
	Timer t;
	t.start();
	std::for_each(
		std::execution::par_unseq,
		a.begin(),
		a.end(),
		action
	);
	t.stop();

	std::cout << "Time for list parallel vectorized for_each: " << t << std::endl << std::endl;
}

template<class T>
void vec(std::list<mytype>& a, T& action)
{
	Timer t;
	t.start();
	std::for_each(
		std::execution::unseq,
		a.begin(),
		a.end(),
		action
	);
	t.stop();

	std::cout << "Time for list vectorized for_each: " << t << std::endl << std::endl;
}

template<class T>
void par(std::list<mytype>& a, T& action)
{
	Timer t;
	t.start();
	std::for_each(
		std::execution::par,
		a.begin(),
		a.end(),
		action
	);
	t.stop();

	std::cout << "Time for list parallel for_each: " << t << std::endl << std::endl;
}

template<class T>
void serial(std::list<mytype>& a, T& action)
{
	Timer t;
	t.start();
	std::for_each(
		std::execution::seq,
		a.begin(),
		a.end(),
		action
	);
	t.stop();

	std::cout << "Time for list serial for_each: " << t << std::endl << std::endl;
}


int main()
{
	srand(1);

	std::list<mytype> a;

	for (size_t i = 0; i < ARRSZ; i++)
		a.push_back(rand());

	int sum = 0;
	auto action = [&](mytype& i) { sum += i; };

	for (size_t i = 0; i < 3; i++) {
		std::cout << "==========" << std::endl;
		std::cout << "PASS " << i + 1 << std::endl;
		std::cout << "==========" << std::endl;

		sum = 0;
		serial<decltype(action)>(a, action);
		par<decltype(action)>(a, action);
		vec<decltype(action)>(a, action);
		pvec<decltype(action)>(a, action);
		std::cout << "Sum: " << sum << std::endl;
	}

	getchar();
	return 0;
}

