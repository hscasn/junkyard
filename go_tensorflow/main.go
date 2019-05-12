package main

import (
	"fmt"
	tg "github.com/galeone/tfgo"
	tf "github.com/tensorflow/tensorflow/tensorflow/go"
	"net/http"
	"strconv"
)

type predictFn func(float64) (float32, error)

func makePredictor(model *tg.Model) predictFn {
	return func(x float64) (float32, error) {
		xInput, err := tf.NewTensor([]float64{x})
		if err != nil {
			return 0, err
		}

		results := model.Exec(
			[]tf.Output{
				model.Op("linear/linear_model/linear_model/linear_model/weighted_sum", 0),
			},
			map[tf.Output]*tf.Tensor{
				model.Op("input_x", 0): xInput,
			},
		)

		predictions := results[0].Value().([][]float32)
		return predictions[0][0], nil
	}
}

func makePredictionController(predict predictFn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vs := r.URL.Query().Get("v")
		v, err := strconv.ParseFloat(vs, 64)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("param 'v' must be a float"))
			return
		}

		p, err := predict(v)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("an error happened while running prediction"))
			return
		}

		w.Write([]byte(fmt.Sprintf("predicted: %f\n", p)))
	}
}

func main() {
	model := tg.LoadModel("model/1557625293", []string{"serve"}, nil)

	predictor := makePredictor(model)
	pcontroller := makePredictionController(predictor)

	http.Handle("/", pcontroller)
	fmt.Println("listening on port 8000")
	http.ListenAndServe(":8000", nil)
}
