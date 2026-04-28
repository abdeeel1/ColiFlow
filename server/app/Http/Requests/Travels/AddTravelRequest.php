<?php

namespace App\Http\Requests\Travels;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AddTravelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
            'from_city_id' => 'required|exists:cities,id|different:to_city_id',
            'to_city_id' => 'required|exists:cities,id',
            'departure_date' => 'required|date',
            'max_weight' => 'required|integer',
            'price' => 'required|integer',
            'car_identifier' => 'required',
            'car_model' => 'required',
            'car_type' => 'required|in:voiture,moto,camionnette,petit_camion',
            'pictures' => 'required|array|min:1|max:3',
            'pictures.*' => 'image|mimes:jpg,jpeg,png|max:2048',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'accepted_categories' => 'required|array',
            'accepted_categories.*' => 'string',
        ];
    }
}
