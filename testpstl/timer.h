#ifndef MCSTL_TIMER_H_H
#define MCSTL_TIMER_H_H

#include <time.h>
#include <iostream>

class Timer {
private:
	bool started_;
	double total_;
	clock_t c_;

public:
	Timer() {
		this->total_ = 0;
		this->started_ = false;
	}

	void start() {
		if (this->started_)
			throw "Timer already started";
		this->c_ = clock();
		this->started_ = true;
	}

	void stop() {
		if (!this->started_)
			throw "Timer was not started";
		this->total_ += double(clock() - this->c_) / CLOCKS_PER_SEC;
		this->started_ = false;
	}

	friend std::ostream &operator<<(std::ostream &out, const Timer &t);
};

std::ostream &operator<<(std::ostream &out, const Timer &t) {
	out << "Elapsed time: " << t.total_ << "s";
	return out;
}


#endif //MCSTL_TIMER_H_H